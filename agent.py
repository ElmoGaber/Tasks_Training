"""Autonomous WhatsApp e-commerce agent powered by Gemini 2.5.

Manages one chat session per customer phone number so that conversation history
and tool calls stay isolated between customers.
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from typing import Any, Dict, Optional

from google import genai
from google.genai import types

import tools

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

SYSTEM_INSTRUCTION = (
    "You are a helpful, autonomous e-commerce shopping assistant on WhatsApp. "
    "You serve customers in both Arabic and English; always reply in the same "
    "language the customer uses. "
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


def _build_client() -> genai.Client:
    if not API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY (or GOOGLE_API_KEY) is not set. "
            "Copy .env.example to .env and fill in your key."
        )
    return genai.Client(
        api_key=API_KEY,
        http_options={"api_version": "v1beta"},
    )


_CLIENT: Optional[genai.Client] = None


def get_client() -> genai.Client:
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


def send_message(phone: str, text: str) -> str:
    """Send a customer message through the agent and return the reply text."""
    chat = get_session(phone)
    response = chat.send_message(text)
    return getattr(response, "text", None) or "Sorry, I could not generate a reply."
