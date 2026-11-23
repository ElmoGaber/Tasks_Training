"""Interactive terminal simulator for testing the agent and tools without WhatsApp.

Usage:
    python simulate_chat.py
Type 'exit' or 'quit' to leave, 'reset' to clear the current session.
"""

from __future__ import annotations

import os
import sys

# Allow running from any cwd.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import agent


def _configure_utf8_stdio() -> None:
    """Force UTF-8 on stdin/stdout/stderr so Arabic survives the console.

    When stdout/stderr are redirected (or the console uses a legacy code page
    such as cp1252), Python encodes with that code page and printing Arabic
    raises UnicodeEncodeError. Piped input is decoded with the same code page,
    so Arabic typed into the simulator turns into mojibake before the agent
    ever sees it. Reconfiguring all three streams keeps text byte-identical.
    """
    streams = (sys.stdin, sys.stdout, sys.stderr)
    for stream in streams:
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            try:
                reconfigure(encoding="utf-8", errors="replace")
            except (ValueError, OSError):
                pass


def main() -> None:
    _configure_utf8_stdio()
    phone = os.getenv("SIM_PHONE", "9647700000000")
    print(f"Simulating customer phone: {phone}")
    print("Type a message (or 'exit' to quit, 'reset' to clear session).")
    while True:
        try:
            text = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not text:
            continue
        if text.lower() in {"exit", "quit"}:
            break
        if text.lower() == "reset":
            agent.reset_session(phone)
            print("Session cleared.")
            continue
        try:
            reply = agent.send_message(phone, text)
        except Exception as exc:
            reply = f"Error: {exc}"
        print(f"Bot: {reply}\n")


if __name__ == "__main__":
    main()
