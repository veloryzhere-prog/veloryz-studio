"""Create the original, silent VELORYZ motion film; no external media."""
import math, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
W,H,FPS=1280,720,24
PAPER=(242,242,233); INK=(31,34,29); ORANGE=(248,116,74)
FONT='/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf'
BOLD='/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf'
fonts={}
def font(size,bold=False):
    key=(size,bold)
    if key not in fonts: fonts[key]=ImageFont.truetype(BOLD if bold else FONT,size)
    return fonts[key]
def ease(x): return 1-(1-max(0,min(1,x)))**3
def text(draw,xy,s,size=32,fill=INK,bold=False):draw.text(xy,s,font=font(size,bold),fill=fill,stroke_width=0)

# Original chrome V: a faceted monogram, lit by a striped environment.
sz=660
mask=Image.new('L',(sz,sz)); md=ImageDraw.Draw(mask)
md.polygon([(75,90),(179,64),(327,365),(477,61),(578,87),(383,533),(273,533)],fill=255)
x=np.linspace(0,1,sz)[None,:]
y=np.linspace(0,1,sz)[:,None]
light=np.clip(.71+.24*np.sin(x*20+y*3)+.11*np.sin(x*47-y*2),.3,1)
arr=np.stack([np.broadcast_to(light,(sz,sz))*244,np.broadcast_to(light,(sz,sz))*247,np.broadcast_to(light,(sz,sz))*235],axis=2).astype(np.uint8)
chrome=Image.fromarray(arr).convert('RGBA');chrome.putalpha(mask)
cd=ImageDraw.Draw(chrome)
cd.line([(75,90),(179,64),(327,365),(477,61),(578,87)],fill=(255,255,249,255),width=3)
cd.line([(273,533),(383,533),(578,87)],fill=(247,249,238,255),width=3)
cd.line([(86,99),(171,77),(326,391),(483,77),(561,96),(374,519),(281,519),(86,99)],fill=(255,255,255,130),width=1)

out=ROOT/'public/assets/studio-film.mp4'
process=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
for frame in range(16*FPS):
    t=frame/FPS; scene=int(t//4); u=t%4
    bg=INK if scene in (1,2) else PAPER
    fg=PAPER if scene in (1,2) else INK
    img=Image.new('RGB',(W,H),bg);d=ImageDraw.Draw(img)
    text(d,(52,33),'VELORYZ STUDIO',18,fg,True)
    text(d,(1053,33),'MOTION / 2026',14,fg)
    d.line((52,74,1228,74),fill=tuple(int(c*.75) for c in fg),width=1)
    shift=int((1-ease(u/.9))*90)
    if scene==0:
        text(d,(62,200+shift),'Built to be',105,INK)
        text(d,(58,306+shift),'remembered.',105,INK,True)
        text(d,(65,456+shift),'INDEPENDENT MINDS. CONNECTED BY DESIGN.',16,INK)
        v=chrome.resize((580,580)).rotate(-9+math.sin(t)*3,resample=Image.Resampling.BICUBIC)
        img.paste(v,(703,113+int(math.sin(t*1.6)*8)),v)
        d=ImageDraw.Draw(img)
        d.ellipse((1110,171,1170,231),fill=ORANGE)
    elif scene==1:
        d.ellipse((830,109,1190,469),outline=(70,77,65),width=1)
        d.ellipse((720,180,1220,590),outline=(70,77,65),width=1)
        r=83+int(math.sin(u)*8); cx=1020+int(math.sin(u*.7)*35);cy=357
        d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=ORANGE)
        text(d,(59,160+shift),'Ideas,',145,PAPER)
        text(d,(55,307+shift),'made tangible.',132,PAPER,True)
        text(d,(66,527),'STRATEGY. EXPRESSION. A LITTLE DIFFERENT THINKING.',17,PAPER)
    elif scene==2:
        words=['DESIGN.','DEVELOP.','DIFFERENT.']
        for i,word in enumerate(words):
            enter=ease((u-i*.16)/.7)
            ox=int((1-enter)*220)
            text(d,(61+ox,121+i*150),word,132,ORANGE if i==2 else PAPER,True)
        d.line((955,130,955,589),fill=(85,93,75),width=1)
        text(d,(990,163),'01 / UI & UX',16,PAPER)
        text(d,(990,208),'02 / WEBSITES',16,PAPER)
        text(d,(990,253),'03 / BRAND',16,PAPER)
        text(d,(990,298),'04 / MOTION',16,PAPER)
        text(d,(990,485),'FROM IDEA',17,PAPER)
        text(d,(990,511),'TO EXPERIENCE.',17,PAPER)
    else:
        text(d,(63,157+shift),'Dream. Build.',113,INK,True)
        text(d,(61,278+shift),'Grow. Together.',113,INK,True)
        text(d,(67,460),'LET’S MAKE YOUR NEXT IDEA HAPPEN.',20,INK)
        text(d,(67,506),'veloryz.here@gmail.com',26,INK)
        cx=1070;cy=350;radius=86
        d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius),fill=ORANGE)
        text(d,(1022,280),'V',116,INK,True)
    d.line((52,644,1228,644),fill=(88,95,80) if scene in (1,2) else (187,191,176),width=1)
    text(d,(53,669),'BOKARO, INDIA / INDEPENDENT SINCE 2025',14,fg)
    text(d,(1065,669),f'0{scene+1} / STUDIO',14,fg)
    # A restrained cut transition, with a paper flash for a smooth loop.
    fade=1-min(1,u/.18) if u<.18 else (max(0,(u-3.82)/.18))
    if fade>0:img=Image.blend(img,Image.new('RGB',(W,H),PAPER),fade)
    if frame==36:img.save(ROOT/'public/assets/studio-poster.jpg',quality=90)
    process.stdin.write(img.tobytes())
process.stdin.close()
if process.wait()!=0:raise RuntimeError('Film encoding failed')
print(f'Created {out.name}: {out.stat().st_size} bytes, 16 seconds, 1280x720 H.264')
