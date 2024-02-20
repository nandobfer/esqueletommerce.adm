import React, { useEffect, useRef, useState } from "react"
import { Box, CircularProgress, Grid, MenuItem, Paper } from "@mui/material"
import { useFormik } from "formik"
import { SignupForm } from "../../types/server/user/signup"
import { default_content_list_style, default_content_wrapper_style } from "../../style/default_content_style"
import { useParams } from "react-router-dom"
import { useUser } from "../../hooks/useUser"
import { FormHeader } from "../../components/FormHeader"
import { Form } from "../../components/Form"
import { TextField } from "../../components/TextField"
import { Button } from "../../components/Button"
import { DatePicker } from "@mui/x-date-pickers"
import dayjs from "dayjs"
import { useIo } from "../../hooks/useIo"
import { UsersEvents } from "../../components/events/UsersEvents"
import { useConfirmDialog } from "burgos-confirm"
import { estados } from "../../tools/estadosBrasil"
import { pronouns } from "../../tools/pronouns"
import { useCepMask, useCpfMask, usePhoneMask } from "burgos-masks"
import MaskedInput from "../../components/MaskedInput"
import { unmask } from "../../tools/unmask"
import { CepEvents } from "../../components/events/CepEvents"

interface UserFormProps {}

export const UserForm: React.FC<UserFormProps> = ({}) => {
    const io = useIo()
    const user = useUser()
    const current_id = Number(useParams().id)
    const current_user = user.list.find((user) => user.id == current_id)
    const cpf_mask = useCpfMask()
    const phone_mask = usePhoneMask()
    const cep_mask = useCepMask()
    const number_ref = useRef<HTMLInputElement>(null)

    const { confirm } = useConfirmDialog()

    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [loadingCep, setLoadingCep] = useState(false)

    const formik = useFormik<SignupForm>({
        initialValues: current_user
            ? { ...current_user }
            : {
                  name: "",
                  cpf: "",
                  email: "",
                  phone: "",
                  birth: "",
                  pronoun: "",
                  password: "",
                  admin: true,
                  image: null,
                  google_id: null,
                  google_token: null,
                  address: {
                      cep: "",
                      street: "",
                      district: "",
                      number: "",
                      city: "",
                      uf: "",
                  },
              },
        onSubmit: (values) => {
            if (loading) return
            setLoading(true)
            console.log(values)
            const data: SignupForm = {
                ...values,
                cpf: unmask(values.cpf),
                phone: unmask(values.phone),
                address: values.address ? { ...values.address, cep: unmask(values.address.cep) } : undefined,
            }
            io.emit(current_user ? "user:update" : "user:signup", data)
        },
        enableReinitialize: true,
    })

    const onDelete = () => {
        if (!current_user) return
        confirm({
            title: "deletar usuário",
            content: "tem certeza?",
            onConfirm: () => {
                setDeleting(true)
                io.emit("user:delete", { id: current_user.id })
            },
        })
    }

    useEffect(() => {
        if (formik.values.address) {
            const cep = formik.values.address.cep
            if (cep.length == 10) {
                setLoadingCep(true)
                io.emit("cep:search", { cep })
            }
        }
    }, [formik.values.address?.cep])

    useEffect(() => {
        if (formik.values.address?.cep.length == 10 && !loadingCep && formik.values.address?.street) {
            number_ref.current?.focus()
        }
    }, [loadingCep, formik.values.address?.cep, formik.values.address?.street])

    return (
        <Paper sx={{ ...default_content_list_style, gap: 3, padding: 3 }}>
            <FormHeader title={current_user ? "editar usuário" : "novo usuário"} />

            <Form onSubmit={formik.handleSubmit} sx={{ flexDirection: "column", gap: 2 }}>
                <Box sx={{ gap: 2, flexDirection: "column" }}>
                    <TextField label="nome" name="name" value={formik.values.name} onChange={formik.handleChange} required fullWidth />
                    <Grid container columns={2} spacing={2}>
                        <Grid item xs={1}>
                            <TextField
                                label="cpf"
                                name="cpf"
                                value={formik.values.cpf}
                                onChange={formik.handleChange}
                                required
                                fullWidth
                                InputProps={{ inputComponent: MaskedInput, inputProps: { mask: cpf_mask, inputMode: "numeric" } }}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <TextField
                                label="telefone"
                                name="phone"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                required
                                fullWidth
                                InputProps={{ inputComponent: MaskedInput, inputProps: { mask: phone_mask, inputMode: "numeric" } }}
                            />
                        </Grid>
                    </Grid>
                    <TextField label="e-mail" name="email" value={formik.values.email} onChange={formik.handleChange} required fullWidth />
                    <Grid container columns={2} spacing={2}>
                        <Grid item xs={1}>
                            <DatePicker
                                value={formik.values.birth ? dayjs(Number(formik.values.birth)).add(3, "hour") : null}
                                onChange={(value) => formik.setFieldValue("birth", value?.valueOf().toString() || "")}
                                format="DD/MM/YYYY"
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <TextField
                                label="pronome de tratamento"
                                name="pronoun"
                                value={formik.values.pronoun}
                                onChange={formik.handleChange}
                                required
                                fullWidth
                                select
                                SelectProps={{ MenuProps: { MenuListProps: { sx: { width: 1 } } } }}
                            >
                                <MenuItem value="" sx={{ display: "none" }} disabled></MenuItem>
                                {pronouns.map((pronoun) => (
                                    <MenuItem key={pronoun} value={pronoun}>
                                        {pronoun}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                    <TextField label="senha" name="password" value={formik.values.password} onChange={formik.handleChange} required fullWidth />
                </Box>
                <Box sx={{ gap: 2, flexDirection: "column" }}>
                    Endereço
                    <TextField
                        label="CEP"
                        name="address.cep"
                        value={formik.values.address?.cep || ""}
                        onChange={formik.handleChange}
                        fullWidth
                        InputProps={{ inputComponent: MaskedInput, inputProps: { mask: cep_mask, inputMode: "numeric" } }}
                    />
                    <TextField
                        label="rua"
                        name="address.street"
                        value={formik.values.address?.street || ""}
                        onChange={formik.handleChange}
                        fullWidth
                        loading={loadingCep}
                    />
                    <Grid container columns={3} spacing={2}>
                        <Grid item xs={2}>
                            <TextField
                                label="bairro"
                                name="address.district"
                                value={formik.values.address?.district || ""}
                                onChange={formik.handleChange}
                                fullWidth
                                loading={loadingCep}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <TextField
                                inputRef={number_ref}
                                label="número"
                                name="address.number"
                                value={formik.values.address?.number || ""}
                                onChange={formik.handleChange}
                                fullWidth
                                loading={loadingCep}
                            />
                        </Grid>
                    </Grid>
                    <Grid container columns={3} spacing={2}>
                        <Grid item xs={2}>
                            <TextField
                                label="cidade"
                                name="address.city"
                                value={formik.values.address?.city || ""}
                                onChange={formik.handleChange}
                                fullWidth
                                loading={loadingCep}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <TextField
                                label="UF"
                                name="address.uf"
                                value={formik.values.address?.uf || ""}
                                onChange={formik.handleChange}
                                fullWidth
                                loading={loadingCep}
                                select
                            >
                                <MenuItem value="" sx={{ display: "none" }} disabled></MenuItem>
                                {estados.map((estado) => (
                                    <MenuItem key={estado.value} value={estado.value}>
                                        {estado.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ alignSelf: "flex-end", gap: 1 }}>
                    {current_user && (
                        <Button variant="outlined" color="error" onClick={onDelete}>
                            {deleting ? <CircularProgress size="1.5rem" color="inherit" /> : "deletar"}
                        </Button>
                    )}
                    <Button variant="contained" type="submit">
                        {loading ? <CircularProgress size="1.5rem" color="inherit" /> : current_user ? "salvar" : "criar"}
                    </Button>
                </Box>
            </Form>

            <UsersEvents setLoading={setLoading} />
            <CepEvents setLoading={setLoadingCep} formik={formik} />
        </Paper>
    )
}
