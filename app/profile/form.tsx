import { Dispatch, SetStateAction, useState } from "react";
import { RxCross2 } from "react-icons/rx";

interface PropsType {
  setEdit: Dispatch<SetStateAction<boolean>>;
  handleUpdate: (interests: string[], description: string) => void;
  currentInterests: string[];
  currentUserDescription: string;
}

const predefinedOptions = [
  "Web Dev",
  "Poetry",
  "Dance",
  "Chess",
  "Competitive Programming",
  "Video Editing",
  "Painting",
  "T-shirt Design",
  "Photography",
  "LLM models",
  "coding",
  "Music",
  "Travel",
  "Content Creation",
  "Social Media Influencing",
  "Enterprenuership",
  "Socail Activity",
  "Body Building",
  "Robotics",
  "Cooking",
  "Blogging",
  "Writing",
  "Reading",
  "Gaming",
  "Sports",
  "Drama",
  "Dance",
  "Singing",
  "Crafting",
  "Drawing",
  "Painting",
  "Photography",
  "Videography",
  "Editing",
  "Designing",
  "Fashion",
  "Modelling",
  "Acting",
  "Anchoring",
  "Public Speaking",
  "Debating",
  "MUN",
  "Hackathons",
  "Competitive Coding",
  "App Development",
  "Game Development",
  "Graphic Designing",
  "UI/UX Designing",
  "Digital Marketing",
  "Content Writing",
  "Blogging",
  "Vlogging",
  "Social Media Influencing",
  "Entrepreneurship",
  "Startup",
  "Finance",
  "Investment",
  "Trading",
  "Economics",
  "Marketing",
  "Management",
  "HR",
  "Law",
  "Legal",
  "Politics",
  "Public Policy",
  "International Relations",
  "History",
  "Geography",
  "Psychology",
  "Sociology",
  "Philosophy",
  "Literature",
  "Languages",
  "Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Astronomy",
  "Astrophysics",
  "Medicine",
  "Engineering",
  "Computer Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Cyber Security",
  "Blockchain",
  "Cloud Computing",
  "IoT",
  "Robotics",
  "Automation",
  "Ethical Hacking",
  "Game Development",
  "App Development",
  "Software Development",
  "Hardware Development",
  "Network Security",
  "Database Management",
  "System Administration",
  "DevOps",
  "Full Stack Development",
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "Desktop Development",
  "Embedded Development",
  "Cloud Development",
  "AI Development",
  "ML Development",
  "Data Analysis",
  "Data Engineering",
  "Data Mining",
  "Data Visualization",
  "Big Data",
  "Business Intelligence",
  "Business Analysis",
  "Business Development",
  "Product Management",
  "Project Management",
  "Quality Assurance",
  "Quality Control",
  "Testing",
  "Technical Support",
  "Customer Support",
  "Customer Success",
  "Sales",
  "Marketing",
  "Advertising",
  "Public Relations",
  "Content Marketing",
  "Email Marketing",
  "Social Media Marketing",
  "SEO",
  "SEM",
  "SMM",
];

const Form = ({
  setEdit,
  handleUpdate,
  currentInterests,
  currentUserDescription,
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
    <form className="max-h-[500px] pt-4 flex flex-col">
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
        >
          Save
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
