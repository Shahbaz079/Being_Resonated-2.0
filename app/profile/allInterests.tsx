import { Dispatch, SetStateAction } from "react";

interface PropsType {
    setShowAllInterests: Dispatch<SetStateAction<boolean>>,
    name: string,
    interests: string[],
}

const AllInterests = ({ setShowAllInterests, name, interests }: PropsType) => {

    const setEdit = (value: boolean) => { }

    return (<div>
        <div className="bg-gray-950 top-0 left-0 h-full w-full bg-opacity-60 fixed" onClick={() => setShowAllInterests(false)}></div>
        <div className="fixed w-[500px] top-44 left-[calc(50%-250px)] max-h-[500px] 
        bg-black rounded-2xl py-4 px-6 shadow-2xl flex flex-col cphone:w-[90%] cphone:left-[5%]">
            <h1 className="capitalize text-3xl">{name}&apos;s Interests</h1>
            <div className="flex gap-3 flex-wrap mt-4 p-2 overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-950 scrollbar-corner-transparent">
                {interests.map((option, index) => <InterestTag key={index} interest={option}></InterestTag>)}
            </div>
        </div>
    </div>)
}

const InterestTag = ({ interest }: { interest: string }) => (
    <div className="border-2 w-fit py-1 px-2 rounded-2xl text-sm bg-[#332A2A] border-red-400 cphone:text-[12px]">
        <span>{interest}</span>
    </div>
)

export default AllInterests;