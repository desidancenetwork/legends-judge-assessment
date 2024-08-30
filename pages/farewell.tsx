const Farewell = () => {

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold mb-4 text-white text-center text-shadow-lg">Thank You!</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p className="text-white text-lg leading-relaxed">
            Your assessment has been successfully submitted.
            We appreciate your participation in the DDN Legends Dance Championship judging process and will be in touch with more information as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Farewell;