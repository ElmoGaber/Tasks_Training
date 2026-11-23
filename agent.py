"""Autonomous WhatsApp e-commerce agent powered by Gemini 2.5.

Manages one chat session per customer phone number so that conversation history
and tool calls stay isolated between customers.

Text integrity: every string that leaves this module is the exact Python ``str``
returned by the model (or a static, human-authored fallback). Nothing here
encodes, decodes, normalizes, reverses, or reshapes Arabic text.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

# Load .env from the project directory so GEMINI_API_KEY / BACKEND_URL work
# regardless of the current working directory. Must run before `import tools`
# because tools.py reads BACKEND_URL at import time.
load_dotenv(BASE_DIR / ".env")

from google import genai
from google.genai import types

import tools

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# API key optional - fallback mode for local demo.
# Placeholder values ("your_api_key", ...) are treated as missing so the demo
# never crashes with an opaque provider 400.
_MIN_API_KEY_LENGTH = 20


def _is_usable_api_key(key: Optional[str]) -> bool:
    if not key:
        return False
    key = key.strip()
    if len(key) < _MIN_API_KEY_LENGTH:
        return False
    return key.lower() not in {
        "your_api_key",
        "your-api-key",
        "your_key_here",
        "replace_me",
        "apikey_here",
        "changeme",
    }


API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

FALLBACK_MODE = not _is_usable_api_key(API_KEY)

SYSTEM_INSTRUCTION = (
    "You are a helpful, autonomous e-commerce shopping assistant on WhatsApp. "
    "You serve customers in both Arabic and English; always reply in the same "
    "language the customer uses. Reply in Egyptian Arabic when the customer "
    "writes in Egyptian Arabic, and in Modern Standard Arabic when the customer "
    "writes formal Arabic. "
    "Write Arabic in Arabic script only: never transliterate Arabic into Latin "
    "letters, never reverse or reorder Arabic characters, and keep the "
    "customer's own words and product names exactly as received. "
    "You have access to real backend tools (products, cart, orders). "
    "ZERO HALLUCINATION POLICY: never invent prices, stock levels, product ids, "
    "cart totals, or order numbers. Always call the relevant backend tool first "
    "and base your answer only on its result. "
    "When a customer request contains multiple actions (search, add to cart, "
    "checkout, tracking, cancellation), execute ALL of them in a single turn by "
    "calling the needed tools together. Do not ask the customer to split their "
    "request. "
    "Format prices and order numbers in bold using *asterisks* and use a few "
    "relevant emojis. Keep replies concise but complete."
)

# One Gemini chat session per customer phone number.
customer_sessions: Dict[str, Any] = {}


def _build_client() -> Optional[genai.Client]:
    if not _is_usable_api_key(API_KEY):
        return None
    return genai.Client(
        api_key=API_KEY,
        http_options={"api_version": "v1beta"},
    )


_CLIENT: Optional[genai.Client] = None


def get_client() -> Optional[genai.Client]:
    global _CLIENT
    if _CLIENT is None:
        _CLIENT = _build_client()
    return _CLIENT


TOOL_FUNCTIONS = [
    tools.list_categories,
    tools.search_products,
    tools.get_product_details,
    tools.get_customer_cart,
    tools.add_item_to_cart,
    tools.remove_cart_item,
    tools.clear_customer_cart,
    tools.checkout_cart,
    tools.track_order,
    tools.cancel_order,
]


def get_session(phone: str):
    """Return (creating if needed) the Gemini chat session for a phone number."""
    if FALLBACK_MODE:
        # In fallback mode, create a dummy session that returns canned responses
        if phone not in customer_sessions:
            customer_sessions[phone] = {"fallback": True}
        return customer_sessions[phone]
    if phone not in customer_sessions:
        client = get_client()
        per_customer_instruction = (
            SYSTEM_INSTRUCTION
            + f"\n\nThe current customer's WhatsApp ID is '{phone}'. "
            "Always use this exact value as customer_name in cart and checkout tools."
        )
        config = types.GenerateContentConfig(
            system_instruction=per_customer_instruction,
            tools=TOOL_FUNCTIONS,
            temperature=0.3,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=False, maximum_remote_calls=10
            ),
        )
        customer_sessions[phone] = client.chats.create(model=MODEL_NAME, config=config)
    return customer_sessions[phone]


def reset_session(phone: str) -> None:
    """Drop the stored session for a customer (e.g. on logout)."""
    customer_sessions.pop(phone, None)


# ============================================================================
# Fallback replies (used when no usable GEMINI_API_KEY is configured)
# ============================================================================
# These are real, human-readable Arabic (Egyptian + MSA) and English strings.
# They are never derived from the customer's text, so nothing can be
# transliterated, reversed or re-encoded on the way out.

ARABIC_REPLIES = {
    "greeting": (
        "أهلاً وسهلاً بيك! 👋 أنا مساعد المتجر الذكي. "
        "أقدر أساعدك في البحث عن المنتجات، إضافة منتجات للسلة، وإتمام الطلب. "
        "تحب تبدأ بإيه؟"
    ),
    "stock": (
        "المخزون بيتحقق من النظام الفعلي مباشرةً، وأنا مش بختلق أرقام. "
        "اكتب اسم المنتج وأنا أقولك الكمية المتاحة. "
        "لتشغيل الوكيل الكامل ضيف GEMINI_API_KEY في ملف .env، "
        "أو استخدم simulator_chat.py لتجربة الأدوات."
    ),
    "cart": (
        "أقدر أساعدك في السلة: ضيف منتجات، اعرض السلة، أو أكمّل الطلب. "
        "اكتب اسم المنتج والكمية اللي تحبها. "
        "لتشغيل الوكيل الكامل ضيف GEMINI_API_KEY في ملف .env."
    ),
    "price": (
        "الأسعار بتتحدد من بيانات المتجر الفعلية، وأنا مش بختلق أسعار. "
        "اكتب اسم المنتج وأنا أجيبلك سعره والمخزون المتاح. "
        "لتشغيل الوكيل الكامل ضيف GEMINI_API_KEY في ملف .env."
    ),
    "thanks": "العفو! 😊 سعيد إني ساعدتك. لو محتاج أي حاجة تانية في المتجر، أنا موجود.",
    "products": (
        "دي منتجات المتجر المتاحة: Mechanical Keyboard بسعر *89.99*، "
        "Wireless Gaming Mouse بسعر *49.99*، Gaming Monitor 27-inch بسعر *279.99*، "
        "USB-C Fast Charging Cable بسعر *14.99*، Aluminum Laptop Stand بسعر *34.99*، "
        "Noise Cancelling Headphones بسعر *149.99*، "
        "و Waterproof Bluetooth Speaker بسعر *59.99* (غير متوفر حاليًا). "
        "اكتب اسم المنتج اللي يهمك وأنا أقولك التفاصيل."
    ),
    "evening": "مساء النور! 🌙 أهلاً بيك في المتجر. تحب تشوف المنتجات ولا عندك طلب معيّن؟",
    "default": (
        "أهلاً بيك! 👋 أنا مساعد المتجر الذكي، وبقدر أساعدك في البحث عن المنتجات، "
        "السلة، وإتمام الطلب. اكتب اللي محتاجه وأنا أساعدك."
    ),
}

ENGLISH_REPLIES = {
    "greeting": (
        "Hello! I'm the smart store assistant. I can help you search for products, "
        "add items to cart, and create orders. How can I help you today?"
    ),
    "stock": (
        "Stock is checked against the live system, so I never invent numbers. "
        "Send me a product name and I'll tell you how many units are available. "
        "For the full agent, add GEMINI_API_KEY to your .env file, "
        "or run simulator_chat.py to try the tools."
    ),
    "cart": (
        "I can help with your cart: add products, view the cart, and check out. "
        "For full operation, set GEMINI_API_KEY in your .env file."
    ),
    "price": (
        "Prices come from the live store data, and I never invent them. "
        "Send me a product name and I'll give you its price and available stock. "
        "For the full agent, set GEMINI_API_KEY in your .env file."
    ),
    "thanks": "You're welcome! 😊 Happy to help. Let me know if you need anything else in the store.",
    "products": (
        "Here are the store products: Mechanical Keyboard (*89.99*), "
        "Wireless Gaming Mouse (*49.99*), Gaming Monitor 27-inch (*279.99*), "
        "USB-C Fast Charging Cable (*14.99*), Aluminum Laptop Stand (*34.99*), "
        "Noise Cancelling Headphones (*149.99*), and Waterproof Bluetooth Speaker "
        "(*59.99*, currently out of stock). Tell me which one you'd like to know more about."
    ),
    "evening": "Good evening! 🌙 Welcome to the store. Would you like to browse products or is there something specific you need?",
    "default": (
        "Hello! I'm the store assistant. Send a message and I'll help you with "
        "products and cart management."
    ),
}

# Arabic script blocks (base, supplement, extended-A, presentation forms).
_ARABIC_RANGES = (
    ("\u0600", "\u06FF"),
    ("\u0750", "\u077F"),
    ("\u08A0", "\u08FF"),
    ("\uFB50", "\uFDFF"),
    ("\uFE70", "\uFEFF"),
)

# Harakat / Quranic marks / superscript alef, used only for intent matching.
_ARABIC_DIACRITICS = frozenset(
    list(range(0x0610, 0x061B))
    + list(range(0x064B, 0x0660))
    + [0x0670]
    + list(range(0x06D6, 0x06EE))
)
_TATWEEL = "\u0640"

_ARABIC_GREETING_WORDS = ("مرحبا", "مرحبتين", "اهلا", "اهلين", "هلا", "السلام عليكم", "هاي")
_ARABIC_STOCK_WORDS = ("مخزون", "متوفر", "متاح", "الكمية", "كمية", "باقي")
_ARABIC_CART_WORDS = ("سلة", "السلة", "عربة", "العربة", "اطلب", "اشتري", "شراء", "cart")
_ARABIC_PRICE_WORDS = ("سعر", "السعر", "بكام", "تمن", "أسعار", "اسعار", "price")
_ARABIC_THANKS_WORDS = ("شكرا", "شكراً", "متشكر", "تسلم", "ميرسي", "thank")
_ARABIC_PRODUCT_WORDS = ("منتجات", "المنتجات", "منتج", "بضاعة", "كتالوج", "products", "product")
_ARABIC_EVENING_WORDS = ("مساء", "مساء الخير", "مساء النور", "good evening")

_ENGLISH_GREETING_WORDS = ("hello", "hi", "hey", "good morning", "good afternoon", "salam")
_ENGLISH_STOCK_WORDS = ("stock", "available", "availability", "quantity", "in stock")
_ENGLISH_CART_WORDS = ("cart", "basket", "order", "buy", "checkout")
_ENGLISH_PRICE_WORDS = ("price", "prices", "cost", "how much")
_ENGLISH_THANKS_WORDS = ("thank", "thanks", "thx")
_ENGLISH_PRODUCT_WORDS = ("product", "products", "catalog", "catalogue", "what do you sell")
_ENGLISH_EVENING_WORDS = ("good evening",)


def _contains_arabic(text: str) -> bool:
    """True if the text contains any character from an Arabic script block."""
    return any(
        low <= ch <= high for ch in text for low, high in _ARABIC_RANGES
    )


def _match_key(text: str) -> str:
    """Casefold and drop diacritics/tatweel. Used for intent matching only."""
    return "".join(
        ch for ch in text if ord(ch) not in _ARABIC_DIACRITICS and ch != _TATWEEL
    ).casefold()


def _matches(haystack: str, word: str) -> bool:
    """Substring match for Arabic (clitics attach), word match for Latin."""
    if word.isascii() and any(ch.isalpha() for ch in word):
        return re.search(rf"\b{re.escape(word)}\b", haystack) is not None
    return word in haystack


def _intent(text: str, *, arabic: bool) -> str:
    """Classify the message into one fallback reply key (matching only)."""
    haystack = _match_key(text)
    checks = (
        ("greeting", _ARABIC_GREETING_WORDS if arabic else _ENGLISH_GREETING_WORDS),
        ("evening", _ARABIC_EVENING_WORDS if arabic else _ENGLISH_EVENING_WORDS),
        ("thanks", _ARABIC_THANKS_WORDS if arabic else _ENGLISH_THANKS_WORDS),
        ("stock", _ARABIC_STOCK_WORDS if arabic else _ENGLISH_STOCK_WORDS),
        ("cart", _ARABIC_CART_WORDS if arabic else _ENGLISH_CART_WORDS),
        ("price", _ARABIC_PRICE_WORDS if arabic else _ENGLISH_PRICE_WORDS),
        ("products", _ARABIC_PRODUCT_WORDS if arabic else _ENGLISH_PRODUCT_WORDS),
    )
    for key, words in checks:
        if any(_matches(haystack, word) for word in words):
            return key
    return "default"


def _fallback_reply(text: str) -> str:
    """Bilingual canned reply used when no Gemini API key is configured."""
    arabic = _contains_arabic(text)
    replies = ARABIC_REPLIES if arabic else ENGLISH_REPLIES
    return replies[_intent(text, arabic=arabic)]


def send_message(phone: str, text: str) -> str:
    """Send a customer message through the agent and return the reply text.

    The reply is returned exactly as produced (model text or static fallback);
    no encoding, normalization or reshaping is applied to it.
    """
    if FALLBACK_MODE:
        return _fallback_reply(text)
    chat = get_session(phone)
    response = chat.send_message(text)
    return getattr(response, "text", None) or "Sorry, I could not generate a reply."
