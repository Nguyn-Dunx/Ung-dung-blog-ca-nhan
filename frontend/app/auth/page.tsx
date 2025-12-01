const Auth = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="w-[32vw] min-h-[80vh] shadow-2xl shadow-gray-500 rounded-xl bg-white p-6">
        {children}
      </div>
    </div>
  );
};

export default Auth;
