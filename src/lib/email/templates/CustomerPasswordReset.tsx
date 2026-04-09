import { Html, Heading, Text, Button, Section, Container, Body } from "@react-email/components";

interface Props {
  name: string;
  resetUrl: string;
}

export function CustomerPasswordResetTemplate({ name, resetUrl }: Props) {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>Restablecer contraseña, {name}</Heading>
            <Text style={text}>
              Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar. Este link expira en 1 hora.
            </Text>
            <Button
              href={resetUrl}
              style={{
                ...button,
                padding: "12px 24px",
              }}
            >
              Restablecer contraseña
            </Button>
            <Text style={text}>
              Si no solicitaste este cambio, puedes ignorar este email de forma segura.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "250px",
  margin: "32px auto",
};
