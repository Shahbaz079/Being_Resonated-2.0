
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface Department {
  name: string;
  path: string;
}

const departments: Department[] = [
  { name: "Computer Science and Engineering", path: "https://drive.google.com/drive/folders/1mW1vdLMHqwk8xxuSzBCG-nOvKlW0S3PG?usp=sharing" },
  { name: "Information Technology", path: "/resources/information-technology" },
  { name: "Electronics Telecommunications", path: "/resources/electronics" },
  { name: "Electrical Engineering", path: "/resources/electrical" },
  { name: "Mechanical", path: "/resources/mechanical" },
  { name: "Civil", path: "/resources/civil" },
  { name: "Aerospace", path: "/resources/aerospace" },
  { name: "Mining", path: "/resources/mining" },
  { name: "Metallurgy", path: "/resources/metallurgy" },
];

const AcademicsPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHeadingVisible, setIsHeadingVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const headingTimer = setTimeout(() => {
      setIsHeadingVisible(true);
    }, 500);

    const mountedTimer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => {
      clearTimeout(headingTimer);
      clearTimeout(mountedTimer);
    };
  }, []);

  const handleNavigation = (path: string) => {
    if (path.startsWith("http")) {
      window.open(path, "_blank");
    } else {
      router.push(path);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-black dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <div className="container mx-auto px-4 py-8 flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-200 to-cyan-100">
            Academic Resources Hub
          </h1>
          <p className="text-xl font-light text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-100 to-cyan-50 mt-4 ">
            Your comprehensive platform for learning, growth, and academic success
          </p>
        </div>

        <div className="flex flex-col space-y-6 items-center">
          {departments.map((dept, index) => (
            <div
              key={index}
              onClick={() => handleNavigation(dept.path)}
              className="transform transition-all duration-500 hover:scale-105 w-[40%]"
            >
              <div className="bg-gray-800 border-2 border-cyan-600 rounded-full p-2 h-full flex flex-col shadow-lg hover:shadow-2xl cursor-pointer hover:bg-gray-700 transition-colors duration-300 dark:bg-gray-700 dark:border-cyan-500">
                <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-light text-cyan-300 text-center hover:text-cyan-200 transition-colors duration-300" style={{ fontFamily: 'Arial' }}>
                  {dept.name}
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademicsPage;