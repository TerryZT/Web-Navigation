
const AppFooter = () => {
  return (
    <footer className="bg-card text-card-foreground py-8 mt-12 border-t">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} All-Subject English Enlightenment. 由 Terry 开发和维护
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;
