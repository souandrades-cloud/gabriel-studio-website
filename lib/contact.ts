/**
 * Canal real de contato do Gabriel Estúdio — WhatsApp (principal) e e-mail
 * (secundário). Único ponto de definição para evitar divergência entre
 * Navbar, Final CTA e Footer.
 */
const WHATSAPP_NUMBER = "5527981122262";
const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site do Gabriel Estúdio e gostaria de conversar sobre um projeto.";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const EMAIL_ADDRESS = "sou.andrades@gmail.com";
const EMAIL_URL = `mailto:${EMAIL_ADDRESS}`;

export { EMAIL_ADDRESS, EMAIL_URL, WHATSAPP_URL };
