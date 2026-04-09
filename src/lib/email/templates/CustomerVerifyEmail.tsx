import { Html, Heading, Text, Button, Section, Container, Body } from "@react-email/components";

interface Props {
  name: string;
  verifyUrl: string;
}

export function CustomerVerifyEmailTemplate({ name, verifyUrl }: Props) {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>Verifica tu email, {name}</Heading>
            <Text style={text}>
              Haz clic en el botón para activar tu cuenta. Este link expira en 24 horas.
            </Text>
            <Button
              href={verifyUrl}
              style={{
                ...button,
                padding: "12px 24px",
              }}
            >
              Verificar mi cuenta
            </Button>
            <Text style={text}>
              Si no creaste esta cuenta, ignora este email.
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
  width: "200px",
  margin: "32px auto",
};
