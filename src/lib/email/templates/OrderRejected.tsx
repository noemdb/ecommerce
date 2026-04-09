import { Html, Heading, Text, Section, Container, Body } from "@react-email/components";

interface Props {
  shortId: string;
  customerName: string;
  reason?: string;
}

export function OrderRejectedTemplate({ shortId, customerName, reason }: Props) {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>Actualización de tu orden #{shortId}</Heading>
            <Text style={text}>Hola {customerName},</Text>
            <Text style={text}>
              Te informamos que ha habido un problema con la verificación de tu pago para la orden #{shortId}.
            </Text>
            {reason && (
              <Text style={text}>
                <strong>Motivo:</strong> {reason}
              </Text>
            )}
            <Text style={text}>
              Por favor, ponte en contacto con nosotros a través de WhatsApp para resolver este inconveniente y procesar tu pedido.
            </Text>
            <Text style={text}>
              Lamentamos los inconvenientes causados.
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
