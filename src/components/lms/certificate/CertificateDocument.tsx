import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    border: "10pt solid #1e293b",
  },
  content: {
    border: "2pt solid #e2e8f0",
    flex: 1,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "#475569",
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 40,
    borderBottom: "2pt solid #2563eb",
    paddingBottom: 10,
    textAlign: "center",
    width: "80%",
  },
  courseLabel: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 10,
  },
  courseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 60,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "auto",
    paddingTop: 20,
    borderTop: "1pt solid #e2e8f0",
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
});

interface CertificateDocumentProps {
  studentName: string;
  courseName: string;
  date: string;
  code: string;
}

export function CertificateDocument({ studentName, courseName, date, code }: CertificateDocumentProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.content}>
          <Text style={styles.header}>Certificado de Finalización</Text>
          <Text style={styles.title}>CERTIFICADO DE LOGRO</Text>
          
          <Text style={styles.subtitle}>Este documento certifica que</Text>
          <Text style={styles.name}>{studentName}</Text>
          
          <Text style={styles.courseLabel}>ha completado con éxito el curso:</Text>
          <Text style={styles.courseName}>{courseName}</Text>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Fecha de emisión: {date}</Text>
            <Text style={styles.footerText}>ID de Verificación: {code}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
