import { Html, Heading, Text, Section, Container, Body } from "@react-email/components";

interface Props {
  shortId: string;
  customerName: string;
}

export function OrderConfirmedTemplate({ shortId, customerName }: Props) {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>¡Orden Confirmada! #{shortId}</Heading>
            <Text style={text}>Hola {customerName},</Text>
            <Text style={text}>
              ¡Buenas noticias! Hemos verificado tu pago y tu orden ya ha sido confirmada.
            </Text>
            <Text style={text}>
              Nuestro equipo está preparando tus productos para el envío. Te mantendremos informado sobre el progreso del despacho.
            </Text>
            <Text style={text}>
              ¡Gracias por tu compra!
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
