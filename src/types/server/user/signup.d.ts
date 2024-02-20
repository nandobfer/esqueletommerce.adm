import { Address } from "../class/Address"
import { User } from "../class/User"
import { ImageUpload } from "../ImageUpload"

interface SignupAddress extends Address {
    id?: number
    init?: (data: AddressPrisma) => void
    user_id?: number
}
export declare interface SignupForm extends User {
    id?: number
    init?: () => Promise<void>
    load?: (data: UserPrisma) => Promise<void>
    update?: (data: Partial<UserPrisma>, socket?: Socket) => Promise<void>
    updateImage?: (image: ImageUpload) => void

    address?: SignupAddress
    image?: string | ImageUpload | null
}
