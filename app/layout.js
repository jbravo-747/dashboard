import "./globals.css";

export const metadata = {
  title: "Dashboard IMCO | Redes y Comunicacion 2026",
  description: "Dashboard interactivo de KPIs de redes sociales y comunicacion de IMCO."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
