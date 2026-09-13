import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from jinja2 import Template

load_dotenv()

def obtener_config_mail():
    load_dotenv(override=True)
    username = os.getenv("MAIL_USERNAME", "noreply@guella.com").strip()
    password = os.getenv("MAIL_PASSWORD", "").strip()
    mail_from = os.getenv("MAIL_FROM", username if "@" in username else "noreply@guella.com").strip()
    if not mail_from or "@" not in mail_from:
        mail_from = "noreply@guella.com"
        
    return ConnectionConfig(
        MAIL_USERNAME=username,
        MAIL_PASSWORD=password,
        MAIL_FROM=mail_from,
        MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Güella MRV").strip(),
        MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
        MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com").strip(),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=bool(username and password and "tu_email" not in username),
        VALIDATE_CERTS=True,
    )

PLANTILLA_RESET = """
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de contraseña - Güella</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:580px;margin:40px auto;padding:0 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#10b981,#14b8a6);border-radius:16px;line-height:56px;font-size:28px;font-weight:900;color:#fff;">G</div>
      <p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:8px 0 0;">MRV Platform</p>
    </div>

    <!-- Card -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 36px;">
      <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Recuperá tu contraseña</h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
        Hola <strong style="color:#e2e8f0;">{{ nombre }}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en Güella.
      </p>

      <p style="color:#94a3b8;font-size:14px;margin:0 0 20px;">
        Hacé clic en el botón para definir una nueva contraseña. Este enlace es válido por <strong style="color:#e2e8f0;">1 hora</strong>.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ reset_url }}"
           style="display:inline-block;background:linear-gradient(135deg,#10b981,#14b8a6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
          Restablecer contraseña
        </a>
      </div>

      <p style="color:#64748b;font-size:12px;margin:24px 0 0;line-height:1.6;">
        Si no solicitaste este cambio, podés ignorar este email. Tu contraseña actual no será modificada.
      </p>

      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;">

      <p style="color:#475569;font-size:11px;margin:0;line-height:1.6;">
        Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
        <a href="{{ reset_url }}" style="color:#10b981;word-break:break-all;">{{ reset_url }}</a>
      </p>
    </div>

    <p style="text-align:center;color:#334155;font-size:11px;margin-top:24px;">
      © Güella MRV Platform. Este es un correo automático, no respondas a este mensaje.
    </p>
  </div>
</body>
</html>
"""


async def enviar_email_reset_password(email: str, nombre: str, reset_url: str):
    """Envía el email de recuperación de contraseña."""
    print("\n=======================================================")
    print("[RECUPERACION DE CONTRASENA]")
    print(f"Para: {nombre} ({email})")
    print(f"Link: {reset_url}")
    print("=======================================================\n")

    config = obtener_config_mail()
    # Si las credenciales son placeholders o no están configuradas, solo mostramos en consola
    username = os.getenv("MAIL_USERNAME", "")
    password = os.getenv("MAIL_PASSWORD", "")
    if not username or "tu_email" in username or not password or "tu_app_password" in password:
        print("[INFO] Credenciales SMTP no configuradas en .env. El enlace fue impreso en consola arriba para pruebas locales.")
        return

    html = Template(PLANTILLA_RESET).render(nombre=nombre, reset_url=reset_url)

    mensaje = MessageSchema(
        subject="Recuperá tu contraseña — Güella MRV",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(config)
        await fm.send_message(mensaje)
        print(f"[OK] Email de recuperacion enviado con exito a {email}")
    except Exception as e:
        print(f"[ERROR] Error al enviar email via SMTP: {e}")
        print(f"[INFO] El link generado para pruebas es: {reset_url}")

