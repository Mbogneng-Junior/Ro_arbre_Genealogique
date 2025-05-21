"use client"

import type React from "react"
import { useState } from "react"
import { Users, UserPlus, X } from "lucide-react"
import ProgressIndicator from "@/components/NewFamilyComponents/ProgressIndicator";
import FamilyInfos from "@/components/NewFamilyComponents/FamilyInfos";
import AddFamilyMemberStep from "@/components/NewFamilyComponents/AddFamilyMemberStep";
import FamilyMemberList from "@/components/NewFamilyComponents/FamilyMemberList";
import FinalStep from "@/components/NewFamilyComponents/FinalStep";
import axiosInstance from "@/lib/axiosConfig/axiosInstance";
import {Family, FamilyMember} from "@/lib/type";




export default function FamilyCreationForm()
{
  const [familyName, setFamilyName] = useState<string>("");
  const [familyDescription, setFamilyDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [showAddMemberForm, setShowAddMemberForm] = useState<boolean>(false);
  const [currentMember, setCurrentMember] = useState<FamilyMember>({
        id: "",
        name: "",
        birthDate: "",
        birthPlace: "",
        gender: "other",
        role: "other",
        imageFile: null,
        imagePreview: null,
      });
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdFamilyId, setCreatedFamilyId] = useState<string>("");





    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {

            const newFile = file;
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentMember(prevMember => ({
                    ...prevMember,
                    imageFile: newFile,
                    imagePreview: reader.result as string,
                }));
            }
            reader.readAsDataURL(file);
        }
    }

      function handleMemberChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)
      {
        const { name, value } = e.target;
        setCurrentMember({
          ...currentMember,
          [name]: value,
        });
      }



      function addMember  (e: React.FormEvent)
      {
        e.preventDefault();

        const newMember = {
          ...currentMember,
          id: `member-${Date.now()}`,
        }
        setMembers([...members, newMember])
        setCurrentMember({
          id: "",
          name: "",
          birthDate: "",
          birthPlace: "",
          gender: "other",
          role: "other",
          imageFile: null,
          imagePreview: null,
        });
        setShowAddMemberForm(false);
      }

      function handleAddMember()
      {
         // console.log(members);
          const dataToSend = members.map((member) => {
              const {id, imagePreview, ...rest} = member;
              console.log("reste ", rest);
              return rest;
          });
          console.log(dataToSend);
      }




      function removeMember (id: string)
      {
        setMembers(members.filter((member) => member.id !== id))
      }




  async function createFamily  (e: React.FormEvent)
  {
      e.preventDefault();
      setIsLoading(true);
      const family: Family = {
        familyName: familyName,
        description: familyDescription,
        username: localStorage.getItem("username") as string /*userData?.username*/
      }
      try
      {
          const response = await axiosInstance.post("/create_family", family);
          setIsLoading(false);
          if(response.status ===200)
          {
              console.log(response?.data);
              localStorage.setItem("currenCreatedFamilyId", response?.data?.data);
              setCreatedFamilyId(response?.data?.data);
              nextStep();
          }
      }
      catch (error)
      {
          setIsLoading(false);
          console.log(error);
      }
  }


  function nextStep(): void
  {
    setStep(step + 1)
  }


  function prevStep(): void
  {
    if(step>2) setStep(step - 1)
  }

  return (
     <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
        <ProgressIndicator step={step}/>
          <div className="p-6">
            {step === 1 && (<FamilyInfos familyName={familyName}
                                         setFamilyName={setFamilyName}
                                         familyDescription={familyDescription}
                                         setFamilyDescription={setFamilyDescription}
                                         handleSubmit={createFamily}
                                         isLoading={isLoading}/>)}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Users className="mr-2" size={24} />
                    Membres de la famille
                  </h2>

                  <button
                    type="button"
                    onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#8BBDBD] hover:bg-[#7AACAC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD]"
                  >
                    {showAddMemberForm ? (
                      <>
                        <X className="mr-1" size={16} />
                        Annuler
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-1" size={16} />
                        Ajouter un membre
                      </>
                    )}
                  </button>
                </div>
                {/* Formulaire d'ajout de membre */}
                {showAddMemberForm  && (
                  <AddFamilyMemberStep currentMember={currentMember} addMember={addMember} handleChange={handleMemberChange} handleChangeRole={handleMemberChange} handleMemberChange={handleMemberChange} handleImageChange={handleImageChange} setShowAddMemberForm={setShowAddMemberForm}/>
                )}
                {/* Liste des membres */}
                <div className="space-y-4 mt-4">
                  {members.length === 0 && !showAddMemberForm ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Users size={48} className="mx-auto text-gray-400"/>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre encore ajouté</h3>
                        <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des membres à votre famille</p>
                    </div>
                  ) : (
                      <FamilyMemberList members={members} removeMember={removeMember}/>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    disabled={step<=2}
                    onClick={prevStep}
                    className="disabled:cursor-not-allowed  inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD]"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#8BBDBD] hover:bg-[#7AACAC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD]"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <FinalStep familyName={familyName}
                         members={members}
                         prevStep={prevStep}
                         isSubmitting={isSubmitting}
                         addMember={handleAddMember}
              />
            )}
          </div>
    </div>
  )
}
