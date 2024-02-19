import React from "react"
import { Box, Paper } from "@mui/material"
import { User } from "../../types/server/class/User"
import { UserComponent } from "./UserComponent"
import { default_content_list_style } from "../../style/default_content_style"

interface UserListProps {
    list: User[]
}

export const UserList: React.FC<UserListProps> = ({ list }) => {
    return (
        <Paper elevation={4} sx={default_content_list_style}>
            {list.map((user) => (
                <UserComponent user={user} key={user.id} />
            ))}
        </Paper>
    )
}
