# คำแนะนำสำหรับผู้ช่วยแบบเอเจนต์ (Codex และ Claude Code อ่านไฟล์นี้)

## ก่อนเริ่มงานทุกครั้ง
- อ่าน BLUEPRINT.md ให้ครบ ทำงานตาม Blueprint เท่านั้น ถ้าคำสั่งขัดกับ Blueprint ให้ถามก่อน
- ตอบและอธิบายเป็นภาษาไทยที่เข้าใจง่าย ผู้ใช้เป็นผู้เริ่มต้น ไม่มีพื้นฐานการเขียนโปรแกรม
- อธิบายแผนสั้น ๆ ก่อนแก้ไฟล์ และทำทีละส่วน

## กฎสำคัญ
- ห้ามเปลี่ยนโครงสร้างข้อมูลหรือชื่อคอลัมน์โดยไม่ถามก่อน
- ห้ามเขียนรหัสลับลงในโค้ด ใช้ process.env และไฟล์ .env.local เท่านั้น
- ห้ามลบไฟล์โดยไม่ถามก่อน
- ตรวจสิทธิ์ผู้ใช้ที่ฝั่งเซิร์ฟเวอร์ ไม่ใช่เพียงซ่อนปุ่มบนหน้าจอ
- หน้าจอเป็นภาษาไทย ใช้บนโทรศัพท์มือถือได้
- Next.js รุ่นที่ติดตั้งอาจใหม่กว่าที่คุณเคยเรียนรู้ ให้อ่านเอกสารใน node_modules/next/dist/docs/ ก่อนใช้ API ที่ไม่แน่ใจ

## เมื่อทำเสร็จ
- รัน npm run build ให้ผ่าน
- สรุปเป็นภาษาไทย: แก้ไฟล์ใด ทำอะไร ทดสอบอย่างไร และผู้ใช้ต้องทดสอบอะไรต่อที่ http://localhost:3000

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
