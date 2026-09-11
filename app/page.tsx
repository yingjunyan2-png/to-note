"use client";

import { ChangeEvent, WheelEvent, useEffect, useRef, useState } from "react";

type Screen = "home" | "profile" | "templates" | "generator" | "result" | "gallery-menu" | "gallery" | "message-intro" | "messages";
type Slot = { x: number; y: number; size: number };
type Template = { id: string; label: string; image: string; slots: Slot[]; text: { x: number; y: number; width: number; rotate?: number } };
type BoardReply = { id: string; text: string; at: number };
type BoardMessage = { id: string; text: string; at: number; likes: number; replies: BoardReply[] };

const copyLines = [
  "祝你开心，在数不尽的明天", "你和我玩，算你有品！", "你超棒的！", "首先要开心，其次都是其次",
  "你是四叶草的最后一片叶子", "细水长流，你的勇气始终比困难多一点", "如果幸福是酵母，你将会是一块很松软的面包",
  "如果幸福是拼图，你将会是最重要的一块", "如果我的心是天平，那我将全部为你倾倒", "长出棱角，是为了成为星星",
  "世界上有个幸福的人，正在读我这句话", "人类需要阳光，拥抱，理解，以及爱、爱自己也算", "渐寒添衣，勿病念好",
  "否极泰来，物极必反", "请无比勇敢，坚韧，爱自己", "你很可爱，所以有点坏也没关系", "早安，午安，晚安",
  "今天有好好吃饭吗？", "愿幸福贯穿你每分每秒", "没有永恒的梅雨季，只有久违的艳阳天", "可以脆弱，可以是不完美的",
  "如果阴雨绵绵，那我做你的晴天", "好柿会花生", "喜欢我就抱抱空气，毕竟我的可爱无处不在", "顺意且顺利",
  "喜欢小动物的人一定不会太坏！", "看你漂亮的眼睛一直在笑，也是我幸福的一种", "世界太宏大了，我们都不要走进悲伤里",
  "抛出的硬币两面都会是幸福", "生活没有意义但是我有今天的太阳和小狗", "画自己喜欢的画，别停笔，小画家", "幸福不在别处，你就是最好的礼物",
];

const templates: Template[] = [
  { id: "wish", label: "许愿款", image: "/assets/IMG_2569.PNG", slots: [], text: { x: .17, y: .35, width: .56 } },
  { id: "heart", label: "爱心心", image: "/assets/IMG_2571.PNG", slots: [{ x: .80, y: .59, size: .20 }], text: { x: .25, y: .22, width: .48 } },
  { id: "dog", label: "小狗狗", image: "/assets/IMG_2565.PNG", slots: [{ x: .80, y: .182, size: .252 }], text: { x: .12, y: .31, width: .49 } },
  { id: "gift", label: "你的出现是礼物", image: "/assets/IMG_2572.PNG", slots: [{ x: .82, y: .45, size: .19 }], text: { x: .25, y: .50, width: .53 } },
  { id: "note", label: "便签款", image: "/assets/IMG_2564.PNG", slots: [{ x: .60, y: .20, size: .203 }], text: { x: .23, y: .40, width: .58, rotate: -7 } },
  { id: "friends", label: "闺蜜天下第一好", image: "/assets/IMG_2567.PNG", slots: [{ x: .183, y: .51, size: .218 }, { x: .844, y: .51, size: .235 }], text: { x: .25, y: .23, width: .50 } },
  { id: "money", label: "钱来", image: "/assets/IMG_2568.PNG", slots: [{ x: .25, y: .26, size: .22 }], text: { x: .33, y: .34, width: .42 } },
  { id: "luck", label: "好运来", image: "/assets/IMG_2570.PNG", slots: [{ x: .18, y: .18, size: .20 }], text: { x: .17, y: .42, width: .50 } },
  { id: "autumn", label: "秋季限定哦~", image: "/assets/IMG_2563.PNG", slots: [{ x: .212, y: .256, size: .204 }], text: { x: .26, y: .38, width: .48 } },
  { id: "birthday", label: "君君祝你生日快乐！", image: "/assets/IMG_2566.PNG", slots: [], text: { x: .16, y: .45, width: .68 } },
];

const templatePositions = [
  [25, 237], [146, 237], [267, 237], [25, 372], [146, 372], [267, 372], [25, 505], [146, 505], [267, 505], [146, 638],
];

const galleryGroups = {
  "9比16": ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.png", "08.png", "09.jpg", "10.jpg"],
  "1比1": ["01.jpg", "02.jpg", "03.png", "04.png", "05.jpg", "06.png", "07.png", "08.png", "09.png", "10.png", "11.png", "12.jpg"],
  "其他": ["01.jpg", "02.jpg", "03.png", "04.png", "05.jpg", "06.png"],
} as const;

const folderFor = (kind: keyof typeof galleryGroups) => kind === "9比16" ? "gallery/portrait" : kind === "1比1" ? "gallery/square" : "gallery/other";
const galleryAssetUrl = (folder: string, file: string) => `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
const heroPhotos = ["/assets/IMG_2641 2.JPG", "/assets/IMG_2629 2.JPG", "/assets/IMG_2632 2.JPG", "/assets/IMG_2633 2.JPG", "/assets/IMG_2634 2.JPG"];

type TemplateLayout = { slots: Slot[]; text: { x: number; y: number; width: number; height: number; rotate?: number; fontScale?: number } };

// 蓝色头像圈均按对应的原始模板画布换算，避免把不同模板的坐标混用。
const templateLayouts: Record<string, TemplateLayout> = {
  wish: { slots: [], text: { x: .178, y: .356, width: .50, height: .45, rotate: -3 } },
  heart: { slots: [{ x: .88, y: .591, size: .201 }], text: { x: .454, y: .357, width: .284, height: .47, fontScale: 1.4 } },
  dog: { slots: [{ x: .80, y: .182, size: .252 }], text: { x: .102, y: .361, width: .43, height: .205 } },
  gift: { slots: [{ x: .822, y: .455, size: .202 }], text: { x: .285, y: .502, width: .426, height: .331 } },
  note: { slots: [{ x: .60, y: .20, size: .203 }], text: { x: .202, y: .444, width: .60, height: .33, rotate: -9 } },
  friends: { slots: [{ x: .183, y: .51, size: .218 }, { x: .844, y: .51, size: .235 }], text: { x: .284, y: .185, width: .452, height: .284 } },
  money: { slots: [{ x: .257, y: .253, size: .238 }], text: { x: .268, y: .413, width: .372, height: .315, fontScale: 1.35 } },
  luck: { slots: [{ x: .165, y: .18, size: .211 }], text: { x: .265, y: .317, width: .343, height: .253, fontScale: 1.35 } },
  autumn: { slots: [{ x: .212, y: .256, size: .204 }], text: { x: .315, y: .33, width: .262, height: .311, fontScale: 1.4 } },
  birthday: { slots: [], text: { x: .149, y: .541, width: .704, height: .28 } },
};

function layoutFor(template: Template): TemplateLayout { return templateLayouts[template.id] ?? { slots: template.slots, text: { ...template.text, height: .32 } }; }

function randomCopy(previous = "") { const choices = copyLines.filter((line) => line !== previous); return choices[Math.floor(Math.random() * choices.length)]; }
function horizontalWheel(event: WheelEvent<HTMLElement>) { if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return; event.currentTarget.scrollLeft += event.deltaY; event.preventDefault(); }
function readFile(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); }); }
function cropCircle(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  const side = Math.min(image.width, image.height); const sx = (image.width - side) / 2; const sy = (image.height - side) / 2;
  ctx.save(); ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(image, sx, sy, side, side, x, y, size, size); ctx.restore();
}
function wrap(ctx: CanvasRenderingContext2D, value: string, maxWidth: number) { const lines: string[] = []; let line = ""; for (const char of value) { if (line && ctx.measureText(line + char).width > maxWidth) { lines.push(line); line = char; } else line += char; } if (line) lines.push(line); return lines; }

function Back({ onClick, home = false }: { onClick: () => void; home?: boolean }) { return <button className="back back-grey" onClick={onClick} aria-label={home ? "返回首页" : "返回上一页"}>←</button>; }

export default function ToSignSite() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState(templates[0]);
  const [hasPickedTemplate, setHasPickedTemplate] = useState(false);
  const [name, setName] = useState("");
  const [avatars, setAvatars] = useState<string[]>([]);
  const [copy, setCopy] = useState(copyLines[0]);
  const [custom, setCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [gallery, setGallery] = useState<keyof typeof galleryGroups>("9比16");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [messages, setMessages] = useState<BoardMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const tell = (value: string) => { setToast(value); window.setTimeout(() => setToast(""), 2200); };

  useEffect(() => { const saved = localStorage.getItem("junjun-message-board-v2"); if (saved) { try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setMessages(parsed.map((item) => ({ id: String(item.id ?? item.at), text: String(item.text ?? ""), at: Number(item.at ?? Date.now()), likes: Number(item.likes ?? 0), replies: Array.isArray(item.replies) ? item.replies.map((reply: BoardReply) => ({ id: String(reply.id ?? reply.at), text: String(reply.text ?? ""), at: Number(reply.at ?? Date.now()) })) : [] }))); } catch { localStorage.removeItem("junjun-message-board-v2"); } } }, []);
  useEffect(() => {
    if (screen !== "result" || !canvasRef.current) return;
    const canvas = canvasRef.current; const base = new Image();
    base.onload = async () => {
      try { await document.fonts.load('48px "HYShiGuangTiW"'); } catch { /* The included handwriting font remains the visual fallback until the licensed HY font file is supplied. */ }
      const side = 1080; canvas.width = side; canvas.height = side;
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      ctx.drawImage(base, 0, 0, side, side);
      const avatarImages = await Promise.all(avatars.map((src) => new Promise<HTMLImageElement>((resolve) => { const image = new Image(); image.onload = () => resolve(image); image.src = src; })));
      const layout = layoutFor(selected);
      layout.slots.forEach((slot, index) => { const image = avatarImages[index]; if (image) { const s = side * slot.size; cropCircle(ctx, image, side * slot.x - s / 2, side * slot.y - s / 2, s); } });
      const { text } = layout; const tx = side * text.x; const ty = side * text.y; const boxWidth = side * text.width; const boxHeight = side * text.height;
      const padding = Math.min(20, Math.max(10, boxWidth * .045)); const usableWidth = boxWidth - padding * 2;
      const fontScale = text.fontScale ?? 1; const toFont = Math.min(70, Math.max(32, usableWidth / 7)) * fontScale; let copyFont = Math.min(60, Math.max(30, usableWidth / 10)) * fontScale; const copyTop = padding + toFont * 1.3;
      ctx.save(); ctx.translate(tx, ty); if (text.rotate) ctx.rotate(text.rotate * Math.PI / 180); ctx.beginPath(); ctx.rect(0, 0, boxWidth, boxHeight); ctx.clip(); ctx.fillStyle = "#211d1d"; ctx.textBaseline = "top";
      ctx.font = `${toFont}px "HYShiGuangTiW", "JunJunHand", KaiTi, STKaiti, serif`; ctx.fillText(`To：${name.trim()}`, padding, padding);
      let lines: string[] = []; let lineHeight = 0; do { ctx.font = `${copyFont}px "HYShiGuangTiW", "JunJunHand", KaiTi, STKaiti, serif`; lines = wrap(ctx, copy, usableWidth); lineHeight = copyFont * 1.26; if (copyTop + lines.length * lineHeight <= boxHeight - padding) break; copyFont -= 1; } while (copyFont > 14);
      ctx.font = `${copyFont}px "HYShiGuangTiW", "JunJunHand", KaiTi, STKaiti, serif`; lines.forEach((line, index) => ctx.fillText(line, padding, copyTop + index * lineHeight)); ctx.restore();
    };
    base.src = selected.image;
  }, [screen, selected, name, avatars, copy]);

  const pickTemplate = (template: Template) => { setSelected(template); setHasPickedTemplate(true); setAvatars([]); window.setTimeout(() => setScreen("generator"), 220); };
  const chooseAvatar = async (event: ChangeEvent<HTMLInputElement>, index: number) => { const file = event.target.files?.[0]; if (!file) return; const src = await readFile(file); setAvatars((current) => { const next = [...current]; next[index] = src; return next; }); };
  const generate = () => { if (!name.trim()) return tell("先写下你的名字哦~"); if (name.trim().length > 10) return tell("名字最多 10 个字哦~"); if (avatars.filter(Boolean).length < layoutFor(selected).slots.length) return tell("头像还没有选完哦~"); setCopy(randomCopy(copy)); setScreen("result"); };
  const save = () => { const canvas = canvasRef.current; if (!canvas) return; const link = document.createElement("a"); link.download = `君君的To签-${name || "宝贝"}.png`; link.href = canvas.toDataURL("image/png"); link.click(); tell("高清图片已开始下载~"); };
  const updateBoard = (recipe: (current: BoardMessage[]) => BoardMessage[]) => setMessages((current) => { const next = recipe(current); localStorage.setItem("junjun-message-board-v2", JSON.stringify(next)); return next; });
  const submitMessage = () => { const value = messageInput.trim(); if (!value) return tell("写一句话再发送吧~"); const now = Date.now(); if (replyToId) updateBoard((current) => current.map((message) => message.id === replyToId ? { ...message, replies: [...message.replies, { id: String(now), text: value, at: now }] } : message)); else updateBoard((current) => [{ id: String(now), text: value, at: now, likes: 0, replies: [] }, ...current].slice(0, 24)); setMessageInput(""); setReplyToId(null); tell("留言已发送~"); };
  const likeMessage = (id: string) => updateBoard((current) => current.map((message) => message.id === id ? { ...message, likes: message.likes + 1 } : message));
  const replyToMessage = (id: string) => { setReplyToId(id); setActiveMessageId(null); requestAnimationFrame(() => messageInputRef.current?.focus()); };

  return <main className="site"><section className="phone" aria-label="君君的 To 签生成器">
    {screen === "home" && <Home onTemplates={() => setScreen("templates")} onGallery={() => setScreen("gallery-menu")} onMessages={() => setScreen("message-intro")} onProfile={() => setScreen("profile")} />}
    {screen === "profile" && <Profile onBack={() => setScreen("home")} />}
    {screen === "templates" && <TemplatePicker selected={selected} hasPicked={hasPickedTemplate} onBack={() => setScreen("home")} onPick={pickTemplate} />}
    {screen === "generator" && <Generator selected={selected} name={name} avatars={avatars} onBack={() => setScreen("templates")} onName={(value) => value.length <= 10 ? setName(value) : tell("名字最多 10 个字哦~")} onAvatar={chooseAvatar} onGenerate={generate} />}
    {screen === "result" && <Result canvasRef={canvasRef} onBack={() => setScreen("generator")} onAnother={() => setCopy(randomCopy(copy))} onCustom={() => { setCustomValue(copy); setCustom(true); }} onSave={save} />}
    {screen === "gallery-menu" && <GalleryMenu onBack={() => setScreen("home")} onOpen={(kind) => { setGallery(kind); setScreen("gallery"); }} />}
    {screen === "gallery" && <Gallery kind={gallery} onBack={() => setScreen("gallery-menu")} onOpen={setLightbox} />}
    {screen === "message-intro" && <MessageIntro onBack={() => setScreen("home")} onContinue={() => setScreen("messages")} />}
    {screen === "messages" && <Messages list={messages} value={messageInput} inputRef={messageInputRef} activeId={activeMessageId} replyingTo={replyToId} onBack={() => setScreen("message-intro")} onChange={setMessageInput} onSend={submitMessage} onSelect={setActiveMessageId} onLike={likeMessage} onReply={replyToMessage} />}
  </section>
  {custom && <div className="modal"><div className="modal-card"><button className="close" onClick={() => setCustom(false)}>×</button><h2>自定义 To 签文案</h2><textarea autoFocus maxLength={50} value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder="写下你想说的话吧~" /><span>{customValue.length}/50</span><button onClick={() => { if (!customValue.trim()) return tell("先写一条文案吧~"); if (customValue.length > 50) return tell("文案最多 50 个字哦~"); setCopy(customValue.trim()); setCustom(false); }}>确认使用</button></div></div>}
  {lightbox && <div className="modal" onClick={() => setLightbox(null)}><div className="image-modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setLightbox(null)}>×</button><img src={lightbox} alt="君君的高清插画" /><a href={lightbox} download>下载高清图</a><p>手机上可长按图片保存</p></div></div>}
  {toast && <div className="toast">{toast}</div>}
  <footer className="site-footer"><a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备2026075455号</a></footer>
  </main>;
}

function Home({ onTemplates, onGallery, onMessages, onProfile }: { onTemplates: () => void; onGallery: () => void; onMessages: () => void; onProfile: () => void }) {
  return <div className="artboard exact-home"><img className="home-reference" src="/assets/screen-home.png" alt="君君的 To 签生成器首页" />
    <button className="home-hit hit-sign" onClick={onTemplates} aria-label="这里生成 To 签" />
    <button className="home-hit hit-gallery" onClick={onGallery} aria-label="君君的图都在这里" />
    <button className="home-hit hit-message" onClick={onMessages} aria-label="君君的留言板" />
    <a className="home-hit hit-xhs" href="https://www.xiaohongshu.com/user/profile/681d51c4000000000e01ed83?xsec_token=AB2oHWmzLJXJULLI4LKPz18QCiqL4ox-1dFg3Em0Ini2s%3D&xsec_source=pc_search" target="_blank" rel="noreferrer" aria-label="打开君君的小红书主页" />
    <button className="home-hit hit-profile" onClick={onProfile} aria-label="打开君君主页" />
    <a className="home-hit hit-douyin" href="https://v.douyin.com/dVJ8wGJb6JE/" target="_blank" rel="noreferrer" aria-label="打开君君的抖音主页" />
  </div>;
}

function Profile({ onBack }: { onBack: () => void }) { return <div className="artboard profile-art"><Back onClick={onBack} /><div className="profile-track" onWheel={horizontalWheel}><article className="profile-slide profile-intro-slide"><img src="/assets/screen-introduction-reference.png" alt="君君的朋友们介绍" /></article>{heroPhotos.slice(1).map((src, index) => <article className="profile-slide" key={src}><img src={src} alt={`君君的介绍图 ${index + 2}`} /></article>)}</div><p className="swipe-hint">向左滑动或长按鼠标滚轮滑动查看图像</p></div>; }

function TemplatePicker({ selected, hasPicked, onBack, onPick }: { selected: Template; hasPicked: boolean; onBack: () => void; onPick: (template: Template) => void }) { return <div className="artboard exact-template"><img className="screen-reference" src="/assets/screen-template-picker.png" alt="选一个 To 签模板" /><Back onClick={onBack} /><div className="template-layer">{templates.map((template, index) => { const [left, top] = templatePositions[index]; const isChosen = hasPicked && selected.id === template.id; return <button className={`template ${isChosen ? "chosen" : ""}`} style={{ left, top }} key={template.id} onClick={() => onPick(template)} aria-label={template.label} aria-pressed={isChosen} />; })}</div></div>; }

function Generator({ selected, name, avatars, onBack, onName, onAvatar, onGenerate }: { selected: Template; name: string; avatars: string[]; onBack: () => void; onName: (value: string) => void; onAvatar: (e: ChangeEvent<HTMLInputElement>, index: number) => void; onGenerate: () => void }) { const slots = layoutFor(selected).slots.length; return <div className={`artboard exact-generator ${slots === 2 ? "two-avatars" : ""}`}><img className="screen-reference" src="/assets/screen-generator.png" alt="填写名字与头像" /><Back onClick={onBack} /><label className="name-input"><input value={name} maxLength={10} onChange={(e) => onName(e.target.value)} placeholder="在这里写下你的名字哦~" /></label>{slots ? <div className={`avatar-row avatars-${slots}`}>{Array.from({ length: slots }).map((_, index) => <label className="avatar-input" key={index}><input type="file" accept="image/*" onChange={(e) => onAvatar(e, index)} />{avatars[index] ? <img src={avatars[index]} alt={`头像 ${index + 1}`} /> : <i>＋</i>}</label>)}</div> : null}<button className="make-button" onClick={onGenerate} aria-label="点击生成" /></div>; }

function Result({ canvasRef, onBack, onAnother, onCustom, onSave }: { canvasRef: React.RefObject<HTMLCanvasElement | null>; onBack: () => void; onAnother: () => void; onCustom: () => void; onSave: () => void }) { return <div className="artboard exact-result"><img className="screen-reference" src="/assets/screen-result.png" alt="保存 To 签" /><Back onClick={onBack} /><div className="preview"><canvas ref={canvasRef} /></div><button className="change" onClick={onAnother} aria-label="换一条" /><button className="customize" onClick={onCustom} aria-label="自定义文案" /><button className="save" onClick={onSave} aria-label="保存到相册" /></div>; }

function GalleryMenu({ onBack, onOpen }: { onBack: () => void; onOpen: (kind: keyof typeof galleryGroups) => void }) { return <div className="artboard dots gallery-motion"><Back onClick={onBack} /><div className="folder-carousel" onWheel={horizontalWheel}>{(Object.keys(galleryGroups) as (keyof typeof galleryGroups)[]).map((kind) => <button key={kind} onClick={() => onOpen(kind)} aria-label={`打开 ${kind} 图片文件夹`}><img src={galleryAssetUrl(folderFor(kind), galleryGroups[kind][0])} alt="" /><b>{kind}</b><span>点击查看</span></button>)}</div></div>; }

function Gallery({ kind, onBack, onOpen }: { kind: keyof typeof galleryGroups; onBack: () => void; onOpen: (src: string) => void }) { const folder = folderFor(kind); return <div className="artboard dots gallery-art"><Back onClick={onBack} /><h1>{kind}</h1><p>点击图片即可查看高清图</p><div className="image-grid">{galleryGroups[kind].map((file) => { const src = galleryAssetUrl(folder, file); return <button onClick={() => onOpen(src)} key={file}><img src={src} alt="君君的插画" /></button>; })}</div></div>; }

function MessageIntro({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) { return <div className="artboard exact-message-intro" role="button" tabIndex={0} onClick={(event) => { if (!(event.target as HTMLElement).closest(".back")) onContinue(); }} onKeyDown={(e) => { if (e.key === "Enter") onContinue(); }}><img className="screen-reference" src="/assets/screen-message-intro.png" alt="留言板提示" /><Back onClick={onBack} /></div>; }

function Messages({ list, value, inputRef, activeId, replyingTo, onBack, onChange, onSend, onSelect, onLike, onReply }: { list: BoardMessage[]; value: string; inputRef: React.RefObject<HTMLInputElement | null>; activeId: string | null; replyingTo: string | null; onBack: () => void; onChange: (value: string) => void; onSend: () => void; onSelect: (id: string | null) => void; onLike: (id: string) => void; onReply: (id: string) => void }) { return <div className="artboard exact-messages"><img className="screen-reference" src="/assets/screen-messages.png" alt="留言板" /><button className="message-back-hit" onClick={onBack} aria-label="返回上一页" /><section>{list.map((message, index) => <article className="comment" style={{ opacity: Math.max(.22, 1 - index * .12) }} key={message.id}><button className="comment-text" onClick={() => onSelect(activeId === message.id ? null : message.id)}><span>{message.text}</span><small>♡ {message.likes}</small></button>{activeId === message.id && <div className="comment-actions"><button onClick={() => onReply(message.id)}>回复</button><button onClick={() => onLike(message.id)}>♡ 点赞</button></div>}{message.replies.map((reply) => <p className="comment-reply" key={reply.id}>↳ {reply.text}</p>)}</article>)}</section><div className={`message-composer ${value ? "has-message" : ""}`}><input ref={inputRef} maxLength={120} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onSend(); }} placeholder="" aria-label={replyingTo ? "回复留言" : "写下留言"} /><button onClick={onSend} aria-label="发送留言" /></div></div>; }
