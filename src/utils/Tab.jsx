export default function Tab({ tabData, field, setField }) {
    return (
      <div
        style={{
          boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
        }}
        className="flex p-1 my-6 rounded-full bg-richblack-800 gap-x-1 max-w-max"
      >
        {tabData.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setField(tab.type)}
            className={`${
              field === tab.type
                ? "bg-yellow-500 text-black"
                : "bg-transparent text-black"
            } py-2 px-5 rounded-full transition-all duration-200`}
          >
            {tab?.tabName}
          </button>
        ))}
      </div>
    );
  }