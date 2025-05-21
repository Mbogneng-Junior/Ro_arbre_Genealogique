import {CalendarIcon, MapPin, User, X} from "lucide-react";
import type React from "react";
import {FamilyMember} from "@/components/NewFamilyComponents/family-creation-form";


export type FamilyMemberListProps = {
    members: FamilyMember[];
    removeMember: (id: string) => void
}

export default function FamilyMemberList({members, removeMember}: FamilyMemberListProps)
{
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
                <div
                    key={member.id}
                    className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                    <div className="absolute top-2 right-2">
                        <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                        >
                            <X size={16}/>
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div
                                    className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {member.imagePreview ? (
                                        <img
                                            src={member.imagePreview || "/placeholder.svg"}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={32} className="text-gray-400"/>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                <p className="text-sm text-gray-500">
                                    {member.role === "parent" ? "Parent" : member.role === "child" ? "Enfant" : "Autre"}
                                </p>
                                {member.birthDate && (
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <CalendarIcon size={12} className="mr-1"/>
                                        {new Date(member.birthDate).toLocaleDateString()}
                                    </p>
                                )}
                                {member.birthPlace && (
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <MapPin size={12} className="mr-1"/>
                                        {member.birthPlace}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className={`h-1 w-full ${
                            member.role === "parent"
                                ? "bg-[#8BBDBD]"
                                : member.role === "child"
                                    ? "bg-[#A8D5BA]"
                                    : "bg-gray-300"
                        }`}
                    ></div>
                </div>
            ))}
        </div>
    )
}