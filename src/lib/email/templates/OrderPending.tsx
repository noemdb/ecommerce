import { Html, Heading, Text, Section, Container, Body } from "@react-email/components";

interface Props {
  shortId: string;
  customerName: string;
}

export function OrderPendingTemplate({ shortId, customerName }: Props) {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>Orden recibida #{shortId}</Heading>
            <Text style={text}>Hola {customerName},</Text>
            <Text style={text}>
              Hemos recibido tu orden y comprobante de pago. Nuestro equipo está verificando la transacción manualmente.
            </Text>
            <Text style={text}>
              Te notificaremos por este medio una vez que hayamos confirmado el depósito.
            </Text>
            <Text style={text}>
              Gracias por tu paciencia y por elegirnos.
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
  textAlign: "left" as const,
  margin: "10px 40px",
};
