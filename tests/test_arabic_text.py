"""Arabic text integrity tests (stdlib unittest, no extra dependencies).

Run:
    python -m unittest discover -s tests -v
"""

from __future__ import annotations

import json
import sys
import types
import unicodedata
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import agent  # noqa: E402

# The exact sentence from the bug report, plus variants that exercise
# harakat, tatweel, mixed scripts, digits and punctuation.
REPORT_SENTENCE = (
    "مرحباً بك يا مؤمن، هذا اختبار لعرض اللغة العربية بشكل صحيح. "
    "هل يمكنك قراءة هذه الجملة دون أي تشويه؟"
)
MIXED_SENTENCE = "Hello, مرحباً! This is a mixed Arabic and English message. أهلاً وسهلاً."
DIACRITICS_SENTENCE = "مُحَمَّدٌ يَكْتُبُ رِسَالَةً طَوِيلَةً مَعَ تَشْكِيل كَامِل."
TATWEEL_SENTENCE = "مـــرحـــبـــا بـــك فـــي المـــتجـــر"
LONG_SENTENCE = (
    "يسعدنا أن نرحب بكم في متجرنا الإلكتروني الذي يقدم تشكيلة واسعة من "
    "المنتجات التقنية والإكسسوارات بأسعار مناسبة، ونحرص على توفير تجربة شراء "
    "سهلة وآمنة تتضمن الدفع عند الاستلام والتوصيل السريع إلى جميع المحافظات. "
    "يمكنكم تصفح الأقسام المختلفة وإضافة ما يعجبكم إلى سلة المشتريات، ثم إتمام "
    "الطلب في خطوات بسيطة، وسيتواصل معكم فريق خدمة العملاء لأي استفسار. "
)

ARABIC_COMBINING = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670} | set(
    range(0x06D6, 0x06EE)
)

MOJIBAKE_HINTS = {"Ø", "Ù", "Ã", "Â", "Ð", "Ñ", "\ufffd"}


def _arabic_replies() -> dict:
    return agent.ARABIC_REPLIES


def _english_replies() -> dict:
    return agent.ENGLISH_REPLIES


class FakeChat:
    """Stands in for a Gemini chat session and echoes back a fixed reply."""

    def __init__(self, reply: str) -> None:
        self._reply = reply
        self.received: list[str] = []

    def send_message(self, text: str):
        self.received.append(text)
        return types.SimpleNamespace(text=self._reply)


class FallbackModeMixin(unittest.TestCase):
    def setUp(self) -> None:
        self._original_mode = agent.FALLBACK_MODE
        agent.FALLBACK_MODE = True

    def tearDown(self) -> None:
        agent.FALLBACK_MODE = self._original_mode


class TestFallbackRepliesAreRealText(unittest.TestCase):
    def test_replies_are_valid_utf8_and_round_trip(self) -> None:
        for lang, replies in (("ar", _arabic_replies()), ("en", _english_replies())):
            for key, text in replies.items():
                with self.subTest(lang=lang, key=key):
                    encoded = text.encode("utf-8")
                    self.assertEqual(encoded.decode("utf-8"), text)
                    self.assertEqual(encoded.decode("utf-8").encode("utf-8"), encoded)
                    self.assertTrue(text.strip())

    def test_replies_contain_no_mojibake_artifacts(self) -> None:
        for lang, replies in (("ar", _arabic_replies()), ("en", _english_replies())):
            for key, text in replies.items():
                with self.subTest(lang=lang, key=key):
                    self.assertFalse(
                        MOJIBAKE_HINTS & set(text),
                        f"{lang}/{key} contains Latin-1/UTF-8 mojibake characters",
                    )
                    self.assertNotIn("Ð", text)
                    self.assertFalse(
                        [ch for ch in text if 0x80 <= ord(ch) <= 0x9F],
                        "C1 control characters present (double-decode artifact)",
                    )

    def test_no_duplicated_diacritics_or_tatweel(self) -> None:
        for lang, replies in (("ar", _arabic_replies()), ("en", _english_replies())):
            for key, text in replies.items():
                with self.subTest(lang=lang, key=key):
                    previous = ""
                    for ch in text:
                        if ch == previous and ord(ch) in ARABIC_COMBINING:
                            self.fail(f"{lang}/{key} has a duplicated diacritic U+{ord(ch):04X}")
                        previous = ch
                    self.assertNotIn("\u0640\u0640", text, "tatweel must not be doubled")

    def test_arabic_replies_are_arabic_and_on_topic(self) -> None:
        expected = {
            "greeting": ["أهلاً", "بيك"],
            "stock": ["المخزون"],
            "cart": ["السلة"],
            "price": ["الأسعار"],
            "thanks": ["العفو"],
            "products": ["Mechanical Keyboard", "Waterproof Bluetooth Speaker"],
            "evening": ["مساء النور"],
            "default": ["المتجر"],
        }
        for key, words in expected.items():
            with self.subTest(key=key):
                text = _arabic_replies()[key]
                self.assertTrue(agent._contains_arabic(text))
                for word in words:
                    self.assertIn(word, text)
                # Arabic must be stored as Arabic letters, not transliteration.
                arabic_letters = [ch for ch in text if "\u0600" <= ch <= "\u06FF"]
                self.assertGreater(len(arabic_letters), 15)

    def test_english_replies_stay_english(self) -> None:
        for key, text in _english_replies().items():
            with self.subTest(key=key):
                self.assertFalse(agent._contains_arabic(text))

    def test_reported_corrupted_text_is_gone(self) -> None:
        corrupted_markers = ("ألٌد ليك علد", "العلربعييةة", "إنانريود", "السعربعياتية")
        all_text = list(_arabic_replies().values()) + list(_english_replies().values())
        for marker in corrupted_markers:
            for text in all_text:
                self.assertNotIn(marker, text)

    def test_arabic_replies_are_nfc_stable(self) -> None:
        # Arabic has no canonical NFC composition, so NFC must be a no-op;
        # if it is not, the source string was assembled from incompatible
        # code points (the classic "duplicated letter" corruption).
        for key, text in _arabic_replies().items():
            with self.subTest(key=key):
                self.assertEqual(unicodedata.normalize("NFC", text), text)


class TestIntentRouting(FallbackModeMixin):
    CASES = {
        "مرحباً": "greeting",
        "السلام عليكم": "greeting",
        "أهلاً وسهلاً": "greeting",
        "عندك مخزون؟": "stock",
        "هل المنتج متوفر؟": "stock",
        "الكمية كام؟": "stock",
        "عايز أضيف للسلة": "cart",
        "بكام اللابتوب؟": "price",
        "السعر كام": "price",
        "شكراً جزيلاً": "thanks",
        "متشكر جداً": "thanks",
        "عايز أشوف المنتجات": "products",
        "مساء الخير": "evening",
        "ابحث عن لابتوب للألعاب": "default",
    }

    def test_arabic_routing(self) -> None:
        for message, key in self.CASES.items():
            with self.subTest(message=message):
                reply = agent.send_message("9647700000000", message)
                self.assertEqual(reply, _arabic_replies()[key])

    def test_english_routing(self) -> None:
        cases = {
            "Hello": "greeting",
            "hey there": "greeting",
            "what products do you sell": "products",
            "do you have stock": "stock",
            "add to cart": "cart",
            "how much is it": "price",
            "thanks a lot": "thanks",
            "good evening": "evening",
            "tell me a joke": "default",
        }
        for message, key in cases.items():
            with self.subTest(message=message):
                reply = agent.send_message("9647700000000", message)
                self.assertEqual(reply, _english_replies()[key])

    def test_mixed_message_answers_in_arabic(self) -> None:
        reply = agent.send_message("9647700000000", MIXED_SENTENCE)
        self.assertTrue(agent._contains_arabic(reply))
        self.assertEqual(reply, _arabic_replies()["greeting"])

    def test_arabic_products_reply_keeps_latin_product_names(self) -> None:
        reply = agent.send_message("9647700000000", "عايز أشوف المنتجات")
        self.assertTrue(agent._contains_arabic(reply))
        for name in ("Mechanical Keyboard", "USB-C Fast Charging Cable"):
            self.assertIn(name, reply)

    def test_english_word_inside_word_is_not_a_keyword(self) -> None:
        # "this" contains "hi"; it must not be treated as a greeting.
        reply = agent.send_message("9647700000000", "this is a question")
        self.assertEqual(reply, _english_replies()["default"])


class TestProviderTextIsNotModified(unittest.TestCase):
    def setUp(self) -> None:
        self._original_mode = agent.FALLBACK_MODE
        self._original_get_session = agent.get_session
        agent.FALLBACK_MODE = False

    def tearDown(self) -> None:
        agent.FALLBACK_MODE = self._original_mode
        agent.get_session = self._original_get_session

    def _round_trip(self, payload: str) -> None:
        chat = FakeChat(payload)
        agent.get_session = lambda phone: chat
        reply = agent.send_message("9647700000000", "أي رسالة")
        self.assertIsInstance(reply, str)
        self.assertEqual(reply, payload)
        self.assertEqual(reply.encode("utf-8"), payload.encode("utf-8"))
        self.assertEqual(len(reply), len(payload))

    def test_report_sentence_passthrough(self) -> None:
        self._round_trip(REPORT_SENTENCE)

    def test_mixed_sentence_passthrough(self) -> None:
        self._round_trip(MIXED_SENTENCE)

    def test_diacritics_passthrough(self) -> None:
        self._round_trip(DIACRITICS_SENTENCE)

    def test_tatweel_passthrough(self) -> None:
        self._round_trip(TATWEEL_SENTENCE)

    def test_long_paragraph_passthrough(self) -> None:
        self._round_trip(LONG_SENTENCE)

    def test_arabic_punctuation_numbers_and_emoji_passthrough(self) -> None:
        payload = "الطلب رقم ١٢٣٤٥ تم بنجاح ✅ السعر ١٩٩٫٩٩ جنيه — شكراً!"
        self._round_trip(payload)

    def test_customer_message_reaches_model_unmodified(self) -> None:
        chat = FakeChat("تم")
        agent.get_session = lambda phone: chat
        agent.send_message("9647700000000", MIXED_SENTENCE)
        self.assertEqual(chat.received, [MIXED_SENTENCE])


class TestTransportLayers(unittest.TestCase):
    def test_json_round_trip_preserves_arabic(self) -> None:
        for payload in (REPORT_SENTENCE, MIXED_SENTENCE, DIACRITICS_SENTENCE):
            with self.subTest(payload=payload[:20]):
                body = json.dumps({"text": payload}, ensure_ascii=False).encode("utf-8")
                self.assertEqual(json.loads(body.decode("utf-8"))["text"], payload)

    def test_fastapi_json_response_preserves_arabic(self) -> None:
        from fastapi.responses import JSONResponse

        payload = {"reply": MIXED_SENTENCE}
        response = JSONResponse(payload)
        body = response.body
        # JSON is UTF-8 by definition (RFC 8259); the body must decode cleanly
        # and the Arabic must survive unmangled and unescaped.
        self.assertTrue(response.headers["content-type"].lower().startswith("application/json"))
        decoded = json.loads(body.decode("utf-8"))
        self.assertEqual(decoded["reply"], MIXED_SENTENCE)
        self.assertIn(MIXED_SENTENCE.encode("utf-8"), body)

    def test_sqlite_round_trip_preserves_arabic(self) -> None:
        import sqlite3

        conn = sqlite3.connect(":memory:")
        try:
            conn.execute("CREATE TABLE t (v TEXT)")
            conn.execute("INSERT INTO t (v) VALUES (?)", (MIXED_SENTENCE,))
            stored = conn.execute("SELECT v FROM t").fetchone()[0]
        finally:
            conn.close()
        self.assertEqual(stored, MIXED_SENTENCE)

    def test_whatsapp_text_extraction_is_lossless(self) -> None:
        try:
            import bot
        except Exception as exc:  # pragma: no cover - optional dependency
            self.skipTest(f"neonize unavailable: {exc}")

        message = types.SimpleNamespace(
            Message=types.SimpleNamespace(conversation=MIXED_SENTENCE, extendedTextMessage=None)
        )
        self.assertEqual(bot._extract_text(message), MIXED_SENTENCE)

        extended = types.SimpleNamespace(
            Message=types.SimpleNamespace(
                conversation="",
                extendedTextMessage=types.SimpleNamespace(text=REPORT_SENTENCE),
            )
        )
        self.assertEqual(bot._extract_text(extended), REPORT_SENTENCE)


class TestApiKeyHandling(unittest.TestCase):
    def test_placeholder_keys_fall_back_instead_of_crashing(self) -> None:
        for value in (None, "", "   ", "your_api_key", "AIza"):
            with self.subTest(value=value):
                self.assertFalse(agent._is_usable_api_key(value))
        self.assertTrue(agent._is_usable_api_key("AIza" + "x" * 35))

    def test_fallback_mode_matches_key_usability(self) -> None:
        # Regression: FALLBACK_MODE used to be `API_KEY is None`, so a
        # placeholder key from .env made every request fail at the provider.
        self.assertEqual(agent.FALLBACK_MODE, not agent._is_usable_api_key(agent.API_KEY))

    def test_dotenv_is_loaded_from_project_dir(self) -> None:
        # Regression: python-dotenv was a dependency but never called, so
        # GEMINI_API_KEY from .env was invisible and the agent always ran in
        # fallback mode.
        self.assertEqual(agent.BASE_DIR, ROOT.resolve())
        source = (ROOT / "agent.py").read_text(encoding="utf-8")
        self.assertIn('load_dotenv(BASE_DIR / ".env")', source)


class TestScriptDetection(unittest.TestCase):
    def test_detects_arabic_variants(self) -> None:
        samples = [
            "مرحبا",  # Arabic
            "\u0750\u0751",  # Arabic Supplement
            "\u08a0\u08a1",  # Arabic Extended-A
            "\ufe8d\ufe8e",  # Arabic Presentation Forms-B
            "١٢٣",  # Arabic-Indic digits live in the Arabic block
        ]
        for sample in samples:
            with self.subTest(sample=sample):
                self.assertTrue(agent._contains_arabic(sample))

    def test_ignores_latin(self) -> None:
        for sample in ("hello", "café", "12345", ""):
            with self.subTest(sample=sample):
                self.assertFalse(agent._contains_arabic(sample))


if __name__ == "__main__":
    unittest.main(verbosity=2)
