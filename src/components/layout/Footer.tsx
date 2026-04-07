export function Footer() {
  return (
    <footer className="border-t py-12 bg-neutral-50 dark:bg-neutral-900 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} Ecommerce Premium. Todos los derechos reservados.
      </div>
    </footer>
  );
}
