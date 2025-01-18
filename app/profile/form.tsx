import { Dispatch, SetStateAction, useState } from "react"
import { RxCross2 } from "react-icons/rx"

interface PropsType {
    setEdit: Dispatch<SetStateAction<boolean>>,
    handleUpdate: (yaer: number, interests: string[]) => void,
    currentGradYear: number,
    currentInterests: string[],
}

const predefinedOptions = ['Web Dev', 'Poetry', 'Dance', 'Chess', 'Competitive Programming', 'Video Editing', 'Painting', 'T-shirt Design', 'Photography', 'LLM models', "coding", "Music", "Travel", "Content Creation", "Social Media Influencing", "Enterprenuership", "Socail Activity", "Body Building", "Robotics", "Cooking", "Blogging", "Writing", "Reading", "Gaming", "Sports", "Drama", "Dance", "Singing", "Crafting", "Drawing", "Painting", "Photography", "Videography", "Editing", "Designing", "Fashion", "Modelling", "Acting", "Anchoring", "Public Speaking", "Debating", "MUN", "Hackathons", "Competitive Coding", "Web Development", "App Development", "Game Development", "Graphic Designing", "UI/UX Designing", "Digital Marketing", "Content Writing", "Blogging", "Vlogging", "Social Media Influencing", "Entrepreneurship", "Startup", "Finance", "Investment", "Trading", "Economics", "Marketing", "Management", "HR", "Law", "Legal", "Politics", "Public Policy", "International Relations", "History", "Geography", "Psychology", "Sociology", "Philosophy", "Literature", "Languages", "Science", "Mathematics", "Physics", "Chemistry", "Biology", "Astronomy", "Astrophysics", "Medicine", "Engineering", "Computer Science", "Artificial Intelligence", "Machine Learning", "Data Science", "Cyber Security", "Blockchain", "Cloud Computing", "IoT", "Robotics", "Automation", "Ethical Hacking", "Game Development", "Web Development", "App Development", "Software Development", "Hardware Development", "Network Security", "Database Management", "System Administration", "DevOps", "Full Stack Development", "Frontend Development", "Backend Development", "Mobile Development", "Desktop Development", "Embedded Development", "Cloud Development", "AI Development", "ML Development", "Data Analysis", "Data Engineering", "Data Mining", "Data Visualization", "Big Data", "Business Intelligence", "Business Analysis", "Business Development", "Product Management", "Project Management", "Quality Assurance", "Quality Control", "Testing", "Technical Support", "Customer Support", "Customer Success", "Sales", "Marketing", "Advertising", "Public Relations", "Content Marketing", "Email Marketing", "Social Media Marketing", "SEO", "SEM", "SMM"];


const Form = ({ setEdit, handleUpdate, currentGradYear, currentInterests }: PropsType) => {
    const [gradYear, setGradYear] = useState<number>(currentGradYear);
    const [interests, setInterests] = useState<string[]>(currentInterests);
    const [currentInterest, setCurrentInterest] = useState<string>(""); // For the interest user is currently typing.
    const [userDescription, setUserDescription] = useState<string>();

    const filteredOptions = predefinedOptions.filter(option =>
        option.toLowerCase().includes(currentInterest.toLowerCase()));

    const handleAddOption = (option: string) => {
        if (!interests.includes(option)) {
            setInterests([...interests, option]);
        }
    };

    const handleRemoveOption = (option: string) => {
        setInterests(interests.filter(item => item !== option));
    };


    return (
        <div>
            <div className="bg-gray-950 top-0 left-0 h-full w-full bg-opacity-60 fixed" onClick={() => setEdit(false)}></div>
            <form className="fixed w-[500px] top-44 left-[calc(50%-250px)] max-h-[500px]
             bg-black rounded-2xl py-4 px-6 shadow-2xl flex flex-col cphone:w-[90%] cphone:left-[5%]">

                <button className="h-10 w-10 rounded-full self-end" type="button" onClick={() => setEdit(false)}>X</button>

                <h1 className="text-3xl mb-[30px] mt-1">Edit Profile</h1>
                <div className="px-3 flex flex-col gap-10 h-max-full overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded scrollbar-track-black scrollbar-thumb-blue-900">
                    <div>
                        <label htmlFor="gradYear" className="ml-1">Graduation Year</label>
                        <input type="number" name="gradYear" placeholder="graduation year" className="mt-1 h-10 w-full self-center rounded-xl p-3"
                            value={gradYear}
                            onChange={(e) => setGradYear(Number(e.target.value))} />
                    </div>

                    <div className="relative">
                        <label htmlFor="interests" className="ml-1">Select Interests</label>
                        <input type="text" name="interests" placeholder="Type to search..." className="mt-1 h-10 w-full self-center rounded-xl p-3"
                            value={currentInterest}
                            onChange={(e) => setCurrentInterest(e.target.value)}></input>
                        {currentInterest && (<div className="dropdown absolute top-20 bg-black p-2 left-[250px] h-[15vh] overflow-y-scroll">
                            {filteredOptions.map((option, index) => (
                                <div key={index}
                                    onClick={() => {
                                        handleAddOption(option); setCurrentInterest('');
                                    }} className="dropdown-item" >

                                    {option} </div>))} </div>)}

                        <div className="p-2 mt-4 scrollbar-corner-white rounded-2xl scrollbar-thumb-black flex gap-3 flex-wrap max-h-36 overflow-y-scroll scrollbar-thin">
                            {/* <div className="w-full h-full absolute top-0 bg-gradient-to-b from-transparent to-black mix-blend-multiply"></div> */}
                            {interests.map((option, index) => (<InterestTag handleRemoveOption={handleRemoveOption} interest={option} key={index} />))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="description" className="ml-1">User Description</label>
                        <textarea name="description" className="rounded-xl p-2" value={userDescription} onChange={(e) => setUserDescription(e.target.value)}></textarea>
                    </div>


                    <button className="w-20 p-2 rounded-xl self-end bg-green-900" type="submit" onClick={() => handleUpdate(gradYear, interests)}>Save</button>
                </div >

            </form >
        </div >



    )
}

const InterestTag = ({ interest, handleRemoveOption }: { interest: string, handleRemoveOption: (option: string) => void }) => (
    <div className="flex w-fit py-1 px-2 gap-3 border-2 rounded-2xl items-center bg-[#332A2A] border-red-400">
        <p>{interest}</p>
        <button className="text-sm" type="button" onClick={() => handleRemoveOption(interest)}><RxCross2 className="mt-[0.5px]"></RxCross2></button>
    </div>
)



export default Form;