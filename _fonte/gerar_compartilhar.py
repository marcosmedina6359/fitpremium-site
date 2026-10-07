# Gera a imagem de prévia do link (1200x630) mostrada no WhatsApp, Instagram e Facebook.
import pathlib, subprocess
AQUI = pathlib.Path(__file__).resolve().parent
SITE = AQUI.parent
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
foto = (SITE / 'fotos' / 'foto-15.jpg').as_uri()
logo = (SITE / 'logo-fit-premium.png').as_uri()
html = f"""<!doctype html><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800&family=DM+Sans:wght@500;700&display=block');
*{{margin:0;box-sizing:border-box}} html,body{{width:1200px;height:630px;overflow:hidden}}
body{{font-family:'DM Sans',sans-serif;background:#38251d;color:#fff3df;display:flex}}
.txt{{width:640px;padding:52px 48px;display:flex;flex-direction:column;justify-content:center}}
.logo{{display:flex;align-items:center;gap:14px;font:800 30px 'Fraunces',serif;margin-bottom:26px}}
.logo img{{width:64px;height:64px;border-radius:50%;background:#fff3df}}
h1{{font:800 58px/1.05 'Fraunces',serif;margin-bottom:18px}} h1 b{{color:#f08a4b}}
.sub{{font-size:28px;margin-bottom:26px;color:#f5dcc6}}
.tags{{display:flex;flex-wrap:wrap;gap:12px}}
.tag{{background:#fff3df;color:#38251d;font-weight:700;font-size:22px;padding:10px 18px;border-radius:999px}}
.tag.v{{background:#1f7a4d;color:#fff}}
.foto{{flex:1;background:url('{foto}') center/cover}}
</style><body><div class="txt">
<div class="logo"><img src="{logo}">Fit Premium</div>
<h1>Marmitas fit de 450 g ou 350 g a partir de <b>R$ 21</b></h1>
<p class="sub">Pode misturar os dois tamanhos no mesmo kit. Monte em 2 minutos.</p>
<div class="tags"><span class="tag v">⚡ Entrega em até 1 dia útil</span><span class="tag">🚚 Frete grátis a partir de 15 marmitas</span></div>
</div><div class="foto"></div></body>"""
h = AQUI / '_compartilhar.html'
h.write_text(html, encoding='utf-8')
png = AQUI / '_compartilhar.png'
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--allow-file-access-from-files',
                '--virtual-time-budget=6000', '--window-size=1200,630', f'--screenshot={png}', h.as_uri()], check=True, capture_output=True)
h.unlink()
from PIL import Image
Image.open(png).convert('RGB').save(SITE / 'compartilhar.jpg', quality=86, optimize=True)
png.unlink()
print('ok compartilhar.jpg')
