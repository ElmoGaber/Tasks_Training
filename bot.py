"""Live WhatsApp bot using Neonize.

Run this after the backend (and your .env) is configured. It prints a QR code
to pair with WhatsApp; once paired it listens for messages and replies via the
Gemini agent.
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from neonize.client import NewClient
from neonize.events import MessageEv

import agent

SESSION_DB = os.getenv("NEONIZE_SESSION_DB", "whatsapp_session.db")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


def _extract_text(message) -> str:
    msg = message.Message
    if hasattr(msg, "conversation") and msg.conversation:
        return msg.conversation
    if hasattr(msg, "extendedTextMessage") and msg.extendedTextMessage.text:
        return msg.extendedTextMessage.text
    return ""


def _sender_phone(message) -> str:
    src = message.Info.MessageSource
    sender = src.Sender
    # Prefer the phone-number JID over the LID.
    if getattr(sender, "User", ""):
        return sender.User
    if getattr(src, "SenderAlt", None) and getattr(src.SenderAlt, "User", ""):
        return src.SenderAlt.User
    return ""


def main() -> None:
    client = NewClient(SESSION_DB)

    @client.event(MessageEv)
    def on_message(client, message):
        # Ignore our own messages and status broadcasts.
        if getattr(message.Info, "IsFromMe", False):
            return
        if getattr(message.Info.MessageSource, "IsGroup", False):
            return

        text = _extract_text(message)
        if not text.strip():
            return

        phone = _sender_phone(message)
        if not phone:
            phone = "unknown"

        try:
            reply = agent.send_message(phone, text)
        except Exception as exc:  # pragma: no cover - runtime safety
            reply = f"Sorry, something went wrong: {exc}"

        chat = message.Info.MessageSource.Chat
        client.send_message(chat, reply)

    print("Starting WhatsApp client. Scan the QR code below to pair.")
    client.connect()


if __name__ == "__main__":
    main()
