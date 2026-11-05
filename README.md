# design-system — Claude Code skills

Bộ skill thiết kế UI Android cho Claude Code.

## Skills
| Skill | Làm gì |
|---|---|
| `android-adb-qa` | Lập kế hoạch và chạy QA thủ công app Android trên máy thật/giả lập qua adb, đo RAM/CPU nền, viết báo cáo (bug kèm bước tái hiện + file:line, đỉnh hiệu năng, bảng PASS/FAIL). `android-design` dùng `scripts/ui.py` (ghép ảnh, điều khiển UI) và `scripts/devstate.sh` (lưu/khôi phục cài đặt máy) cho bước kiểm tra thiết kế trên máy. |
| `android-design` | Thiết kế, review, audit, polish UI Android (Jetpack Compose + Material 3). Đầu ra: flow HTML (`flow.html` live, agent đọc được), Figma (khi có file), hoặc code Compose. Giữ base flow cố định của team (Splash → Ngôn ngữ → 4 trang Onboarding), chọn hướng thiết kế bằng `deal.mjs`, sinh theme Compose + CSS token bằng `theme.mjs`, dựng/kiểm tra flow bằng `new-flow.mjs` / `build-flow.mjs`. |

Gọi trong Claude Code: `/android-design [flow · figma · theme · critique · audit · polish …] [mục tiêu]`, hoặc nói tự nhiên ("thiết kế UI app android…", "dựng flow html…").

## Cài trên máy mới
```bash
git clone https://github.com/TranVanHien1/design-system.git ~/design-system
cd ~/design-system && ./install.sh      # symlink android-design + android-adb-qa vào ~/.claude/skills/ (bản cũ cất ở ~/.claude/skills-backup/)
```
Cập nhật: `cd ~/design-system && git pull` (symlink nên không cần cài lại). Mở phiên Claude Code mới để nạp.

## Yêu cầu
- Node.js ≥ 18 (script `deal.mjs`, `theme.mjs`, `flow/*.mjs`; không cần `npm install`, thư viện màu Material đã vendor sẵn).
- Google Chrome/Chromium (chỉ cho `build-flow.mjs --shots` / `--images`).
- Python 3 + Pillow (ghép ảnh kiểm tra, `android-adb-qa/scripts/ui.py montage`).
- Android SDK platform-tools (`adb`) cho `android-adb-qa` và bước kiểm tra trên máy.
- Figma MCP (connector claude.ai) cho phần đọc/dựng Figma.
- Tạo ảnh minh họa: công cụ ngoài (ví dụ Antigravity `agy`), chưa nằm trong skill.

## Cấu trúc `android-design/`
- `SKILL.md` — router, nguyên tắc, bảng lệnh.
- `references/` — luật: base-flow, html-flow, figma, android-m3, craft-floor, tells, operate, **components** (component của team đo từ Figma), reference-patterns (nghiên cứu Figma của team) và các playbook lệnh.
- `scripts/` — `deal.mjs`, `theme.mjs`, `flow/new-flow.mjs`, `flow/build-flow.mjs`, `maintain/build-data.mjs`.
- `assets/flow/` — `kit.css` (M3), **`team.css`** (component của team: ads, nav, dialog, paywall, nút…), `state.js`, viewer `flow-template*.html`, mẫu base `base/*.html` (khung 412×917), mẫu chung `common/*.html` (paywall, quyền, dialog, bảng ads).
- `data/` — styles, palettes, type (đánh dấu hỗ trợ tiếng Việt; Momo Trust Sans là font mặc định của team), kinds, patterns, topic-worlds, **components.json** (177 component, 43 layout, có nodeId Figma).
- `MAINTAINING.md` — cách bảo trì; `NOTICE.md` + `licenses/` — ghi công Impeccable (Apache-2.0), Taste Skill (MIT), material-color-utilities (Apache-2.0).
