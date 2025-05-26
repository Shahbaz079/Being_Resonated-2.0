"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";


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



  return (
    <div className="relative min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-200 to-cyan-100">
            Academic Resources Hub
          </h1>
          <p className="text-xl font-light text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-100 to-cyan-50 mt-4">
            Your comprehensive platform for learning, growth, and academic success
          </p>
        </div>

        <div className="flex flex-col space-y-4" style={{textAlign: "center"}}>
          {departments.map((dept, index) => (
            <Link href={dept.path}
              key={index}
         
              className="bg-gray-800 border-2 border-cyan-600 rounded-full px-4 py-3 text-cyan-300 font-medium text-lg shadow-lg hover:shadow-2xl hover:bg-gray-700 transition duration-300 cursor-pointer w-fit"
              style={{ minWidth: "300px" ,textAlign: "center", margin: "auto", marginTop: "20px" }}
            >
              {dept.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademicsPage;
