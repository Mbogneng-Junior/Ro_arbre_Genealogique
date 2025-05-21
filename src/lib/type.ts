export type RegistrationFormType = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    dateOfBirth: string,
}


export type FamilyFormType = {
    familyName: "",
    username: "",
}

export type AxiosResponse<T>={
    date:T,
    text:string,
    value:string
}


export type AxiosRegistrationResponse={
    data:AxiosResponse<string>,
}

export type LoginFormType = {
    email:"",
    password:""
}

export type AxiosLoginResponse={
    data:AxiosResponse<object>,
}

export type UserType = {
    username: string,
    id: string,
    email: string
    firstName: string,
    lastName: string,
    dateOfBirth: string
}




export type FamilyType = {
    familyName: string,
    id: string,
    numberOfMembers: string
}

export interface FamilyMember {
    id: string
    firstName: string,
    lastName?: string,
    dateOfBirth: string
    birthPlace: string
    gender: "homme" | "femme",
    role: "parent" | "enfant",
    email?:string,
    imageFile: File | null
    imagePreview: string | null
}

export interface Family {
    familyName: string,
    description: string,
    username?:string
    members?: FamilyMember[]
}