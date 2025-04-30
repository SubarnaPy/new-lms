
import Pic1 from "../../Assetss/Image/ai-generated-8575440.png";
import Pic2 from "../../Assetss/Image/child-1073638.jpg";
import Pic3 from "../../Assetss/Image/ai-generated-8575440.png";
const HeroSection2 = () => {
  return (
    <>
    <div className="relative flex justify-center w-full bg-gradient-to-r from-[#0070f3] to-[#00ffab]">
    <div className="absolute top-[-50px] bg-gradient-to-r from-[#0070f3] to-[#00ffab] rounded-xl py-2 px-6 shadow-lg text-center text-white flex space-x-8 md:space-x-16">
      <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold">500,000+</h3>
        <p className="text-lg">Happy Users</p>
    </div>
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold">200+</h3>
      <p className="text-lg">Companies</p>
   </div>
 </div>
</div>
  


  <div className="py-10 px-4 bg-[#ffffff]">
  <h2 className="mb-6 text-3xl font-semibold text-center text-gray-950 md:text-4xl">
    Why Choose Us?
  </h2>
  <p className="max-w-3xl mx-auto mb-10 text-lg text-center text-slate-950">
    Our platform provides a comprehensive and innovative learning
    experience. We offer a wide range of courses tailored to help you
    build skills that matter for the future.
  </p>
  <div className="flex flex-wrap justify-center gap-6">
    {[Pic1, Pic2, Pic3].map((pic, index) => (
      <div
        key={index}
        className="relative overflow-hidden rounded-lg shadow-lg w-60 h-60 group"
      >
        <img
          src={pic}
          alt={`Feature ${index + 1}`}
          className="object-cover w-full h-full transition duration-500 transform group-hover:scale-110"
        />
        <div className="absolute inset-0 flex items-center justify-center transition bg-black opacity-0 bg-opacity-40 group-hover:opacity-100">
          <p className="text-lg font-medium text-white">{`Feature ${
            index + 1
          }`}</p>
        </div>
      </div>
    ))}
  </div>
</div>
</>
    
  )
}

export default HeroSection2
