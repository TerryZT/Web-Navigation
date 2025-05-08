const AppFooter = () => {
  return (
    <footer className="bg-card text-card-foreground py-8 mt-12 border-t">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Link Hub. All rights reserved.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Built with Next.js and ShadCN UI.
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;