export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-[#004B87] mb-8 text-center">
        Tracking Monitoring App
      </h1>
      
      <p className="text-lg text-gray-400 leading-relaxed text-justify">
        The "Tracking Monitoring" App is designed to track and monitor transportation 
        orders by processing Excel data automatically. The data is imported based on 
        a predefined mapping specified in a separate Excel file. The fields are fixed 
        to ensure uniform management and display of tracking information.
      </p>
    </div>
  );
}