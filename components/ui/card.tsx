import * as React from "react"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { IUser } from "../expandableCards/card"
import Link from "next/link"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const TeamMembersCard = ({ members }: { members: IUser[] }): JSX.Element => (
  <Card className="mt-10 bg-transparent border-0">
    <CardContent>
      <div className="flex flex-wrap gap-6 justify-center">
        {members.map((member) => (
          <Card
            key={member._id.toString()}
            className="w-[140px] sm:w-[160px] bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-md border border-cyan-500/10 rounded-xl shadow-lg hover:shadow-cyan-700/30 transition duration-300"
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-[100px] h-[100px] relative mb-3">
                {member.image && (
                  <Image
                    className="rounded-full border-2 border-cyan-400 object-cover"
                    alt={member.name}
                    src={member.image}
                    layout="fill"
                  />
                )}
              </div>

              <Link
                href={`/profile?id=${member._id.toString()}`}
                className="text-center text-sm sm:text-base text-cyan-200 font-semibold hover:text-cyan-100 transition duration-200 capitalize"
              >
                {member.name}
              </Link>
              <p>
                {member.description?.slice(0, 50)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {member.gradYear}
                </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent , TeamMembersCard }
