import { Dispatch, SetStateAction, useState } from "react";
import { RxCross2 } from "react-icons/rx";

interface PropsType {
  
  handleUpdate: (interests: string[], description: string) => void;
  currentInterests: string[];
  currentUserDescription: string;
  uploading?: boolean;
}

const predefinedOptions =[
  "Acting",
  "Aerobics",
  "AI Development",
  "Anchoring",
  "App Development",
  "Artificial Intelligence",
  "Astronomy",
  "Astronomy Observation",
  "Astrophysics",
  "Backend Development",
  "Badminton",
  "Baseball",
  "Basketball",
  "Big Data",
  "Bird Watching",
  "Blockchain",
  "Blogging",
  "Board Games",
  "Body Building",
  "Business Analysis",
  "Business Development",
  "Business Intelligence",
  "Bungee Jumping",
  "Calligraphy",
  "Car Racing",
  "Card Games",
  "Chess",
  "Cricket",
  "Cloud Computing",
  "Coding",
  "Community Service",
  "Competitive Coding",
  "Competitive Programming",
  "Concerts",
  "Content Creation",
  "Content Writing",
  "Cooking",
  "Crafting",
  "Cricket",
  "Crocheting",
  "Cryptocurrency",
  "Cyber Security",
  "Dance",
  "Data Analysis",
  "Data Engineering",
  "Data Mining",
  "Data Science",
  "Data Visualization",
  "Debate",
  "Designing",
  "Digital Marketing",
  "DIY Projects",
  "Drama",
  "Drawing",
  "Economics",
  "Editing",
  "Embedded Development",
  "Engineering",
  "Entrepreneurship",
  "Escape Rooms",
  "Ethical Hacking",
  "Fashion",
  "Finance",
  "Fishing",
  "Football",
  "Frontend Development",
  "Full Stack Development",
  "Gardening",
  "Game Development",
  "Gaming",
  "Geography Exploration",
  "Golf",
  "Graphic Designing",
  "Gym",
  "Hackathon",
  "Hiking",
  "History Enthusiast",
  "Hockey",
  "Home Décor",
  "Horse Riding",
  "International Relations",
  "Investment",
  "IoT",
  "Juggling",
  "Kayaking",
  "Knitting",
  "Languages",
  "LLM Models",
  "Machine Learning",
  "Magic Tricks",
  "Management",
  "Martial Arts",
  "Mathematics",
  "Meditation",
  "Medicine",
  "Mixology",
  "Mobile Development",
  "Modelling",
  "Mountaineering",
  "Movie Nights",
  "MUN",
  "Music",
  "Network Security",
  "Painting",
  "Paragliding",
  "Parkour",
  "Pet Care",
  "Philosophy",
  "Photography",
  "Physics",
  "Podcasting",
  "Poetry",
  "Polo",
  "Politics",
  "Pottery",
  "Public Speaking",
  "Quiz",
  "Rafting",
  "Reading",
  "Robotics",
  "Rock Climbing",
  "Rugby",
  "Running",
  "Science",
  "Scuba Diving",
  "Sculpting",
  "Skateboarding",
  "Skating",
  "Skiing",
  "Sky Diving",
  "SMM",
  "Snowboarding",
  "Social Activities",
  "Social Media Influencing",
  "Sociology",
  "Soap Making",
  "Softball",
  "Sports",
  "Startup",
  "Storytelling",
  "Swimming",
  "Table Tennis",
  "Tea Appreciation",
  "Tennis",
  "Tiptap",
  "Trekking",
  "Travel",
  "Trivia Nights",
  "UI/UX Designing",
  "Urban Exploration",
  "Vlogging",
  "Volunteer Work",
  "Web Development",
  "Wildlife Safari",
  "Wine Tasting",
  "Writing",
  "Yoga",
  "Zumba"
];

const Form = ({

  handleUpdate,
  currentInterests,
  currentUserDescription,
  uploading
}: PropsType) => {
  const [interests, setInterests] = useState<string[]>(currentInterests);
  const [currentInterest, setCurrentInterest] = useState<string>(""); // For the interest user is currently typing.
  const [userDescription, setUserDescription] = useState<string>(
    currentUserDescription
  );

  const filteredOptions = predefinedOptions.filter((option) =>
    option.toLowerCase().includes(currentInterest.toLowerCase())
  );

  const handleAddOption = (option: string) => {
    if (!interests.includes(option)) {
      setInterests([...interests, option]);
    }
  };

  const handleRemoveOption = (option: string) => {
    setInterests(interests.filter((item) => item !== option));
  };

  return (
    <form className="max-h-[500px] pt-4 flex flex-col" onSubmit={(e) => e.preventDefault()}>
      <div className="px-3 flex flex-col gap-10 h-max-full overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded scrollbar-track-slate-950 scrollbar-thumb-cyan-500">
        <div className="relative">
          <label htmlFor="interests" className="ml-1 text-cyan-300">
            Select Interests
          </label>
          <input
            type="text"
            name="interests"
            placeholder="Type to search..."
            className="border-2 border-cyan-600 h-10 w-full self-center rounded-xl p-3 mt-3 bg-black"
            value={currentInterest}
            onChange={(e) => setCurrentInterest(e.target.value)}
          ></input>
          {currentInterest && (
            <div className="dropdown absolute top-20 bg-slate-900 p-2 w-full max-h-[140px] overflow-y-scroll scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-cyan-500">
              {filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    handleAddOption(option);
                    setCurrentInterest("");
                  }}
                  className="dropdown-item border-b-2 hover:bg-gray-700 cursor-pointer hover:scale-[1.01] transition-all duration-100 rounded-lg py-1"
                >
                  {option}{" "}
                </div>
              ))}{" "}
            </div>
          )}

          <div className="p-2 mt-4 scrollbar-corner-white rounded-2xl scrollbar-thumb-black flex gap-3 flex-wrap max-h-36 overflow-y-scroll scrollbar-thin">
            {interests.map((option, index) => (
              <InterestTag
                handleRemoveOption={handleRemoveOption}
                interest={option}
                key={index}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="ml-1 text-cyan-300">
            Tagline
          </label>
          <textarea
            name="description"
            className="border-2 border-cyan-600 rounded-xl p-2 bg-black mt-2"
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
          ></textarea>
        </div>

        <button
          className="w-20 p-2 rounded-xl self-end bg-green-900"
          type="submit"
          onClick={() => handleUpdate(interests, userDescription)}
          disabled={uploading}
        >
          {uploading ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
};

const InterestTag = ({
  interest,
  handleRemoveOption,
}: {
  interest: string;
  handleRemoveOption: (option: string) => void;
}) => (
  <div className="flex w-fit py-1 px-2 gap-3 border-2 rounded-2xl items-center bg-[#332A2A] border-red-400">
    <p>{interest}</p>
    <button
      className="text-sm"
      type="button"
      onClick={() => handleRemoveOption(interest)}
    >
      <RxCross2 className="mt-[0.5px]"></RxCross2>
    </button>
  </div>
);

export default Form;
