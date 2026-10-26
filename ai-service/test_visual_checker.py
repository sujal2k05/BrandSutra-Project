import pytest
import io
from PIL import Image
from services.visual_checker import analyze_visual_asset

def test_visual_checker_aspect_ratio_and_colors():
    # 1. Create a 1080x1080 (1:1 Square) image matching brand color #6366F1
    img = Image.new('RGB', (1080, 1080), color=(99, 102, 241))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    img_bytes = buf.getvalue()

    result = analyze_visual_asset(
        image_bytes=img_bytes,
        marketing_channel="INSTAGRAM",
        primary_color_hex="#6366F1",
        secondary_color_hex="#8B5CF6",
        filename="test_feed.png"
    )

    assert result["status"] == "COMPLETED"
    assert result["metadata"]["dimensions"] == "1080x1080"
    assert result["metadata"]["aspectRatio"] == "1.0:1"
    # Perfectly matches brand color #6366F1, so no color palette violation!
    color_findings = [f for f in result["findings"] if "color palette" in f.issue.lower()]
    assert len(color_findings) == 0

def test_visual_checker_detects_violations():
    # 2. Create an off-brand 500x1200 image in pure red (color violation + aspect ratio violation)
    img = Image.new('RGB', (500, 1200), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    img_bytes = buf.getvalue()

    result = analyze_visual_asset(
        image_bytes=img_bytes,
        marketing_channel="INSTAGRAM",
        primary_color_hex="#6366F1",
        secondary_color_hex="#8B5CF6",
        filename="bad_asset.png"
    )

    assert result["status"] == "COMPLETED"
    # Should detect aspect ratio violation and color violation
    issues = [f.issue.lower() for f in result["findings"]]
    assert any("aspect ratio" in i for i in issues)
    assert any("color palette" in i for i in issues)
