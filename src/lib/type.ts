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