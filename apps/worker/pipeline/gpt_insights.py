import json
from openai import OpenAI
from config import settings

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        # OpenRouter is fully compatible with the OpenAI SDK —
        # just swap the base_url and use the OpenRouter API key.
        _client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openrouter_api_key,
        )
    return _client


def generate_insights(
    overall_score: float,
    grade: str,
    s_avg: float,
    m_avg: float,
    e_avg: float,
    drops: list[dict],
    silence_analysis: list[dict],
    avg_continuity: float,
    avg_speech_rate: float,
    transcript_excerpt: str,
    hook_text: str,
) -> dict:
    client = get_client()

    severe_drops = [d for d in drops if d["drop"] > 10]
    dead_silence = sum(1 for s in silence_analysis if s["type"] == "dead_silence")
    dramatic_pause = sum(1 for s in silence_analysis if s["type"] == "dramatic_pause")
    drop_penalty = min(25, len(severe_drops) * 5)

    prompt = f"""You are a video content strategist analyzing a video for a creator.

Video metrics:
- Overall score: {overall_score:.1f}/100 (Grade: {grade})
- Hook (first third): {s_avg:.0f}/100
- Middle: {m_avg:.0f}/100
- Ending: {e_avg:.0f}/100
- Severe attention drops: {len(severe_drops)} (drop penalty: -{drop_penalty})
- Dead silences: {dead_silence}
- Dramatic pauses: {dramatic_pause}
- Avg semantic continuity: {avg_continuity:.2f}
- Avg speech rate: {avg_speech_rate:.1f} words/sec

Hook text (first 15s): "{hook_text}"

Attention drops detected:
{json.dumps(drops[:5], indent=2) if drops else "None"}

Transcript excerpt: "{transcript_excerpt[:400]}"

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "2-3 sentence overall assessment of the video",
  "hook_analysis": "1-2 sentences about the opening hook quality",
  "recommendations": [
    {{"priority": "high", "text": "recommendation text", "timestamp": null}},
    {{"priority": "medium", "text": "recommendation text", "timestamp": 45}},
    {{"priority": "low", "text": "recommendation text", "timestamp": null}}
  ],
  "tags": ["tag1", "tag2", "tag3"]
}}

Recommendations should be specific, actionable, and reference timestamps when relevant.
Generate 4-6 recommendations. Tags should be content descriptors (e.g. "talking-head", "fast-paced", "educational").
"""

    response = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
        temperature=0.4,
        extra_headers={
            "HTTP-Referer": "https://vilyze.app",
            "X-Title": "Vilyze",
        },
    )

    raw = response.choices[0].message.content or "{}"

    # Strip markdown code fences if model wraps JSON in ```json ... ```
    if raw.strip().startswith("```"):
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "summary": raw[:500],
            "hook_analysis": "",
            "recommendations": [],
            "tags": [],
        }
