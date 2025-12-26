'use client'

import { Activity, useState, useTransition } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { Field, FieldLabel } from '@/components/ui/field'
import { create } from 'zustand'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { PrismaClientKnownRequestError } from '@/prisma/generated/internal/prismaNamespace'
import { registerAction } from '@/actions/auth.actions'
import { toast } from 'sonner'

type Step = 'credentials' | 'totp' | 'register'
type Store = {
    step: Step
    setStep: (step: Step) => void
}
const useStep = create<Store>()(set => ({
    step: 'credentials',
    setStep: step => set({ step }),
}))

export default function LoginPage() {
    const step = useStep(({ step }) => step)
    return (
        <div className='bg-muted/40 flex min-h-screen items-center justify-center'>
            <Activity mode={step === 'credentials' ? 'visible' : 'hidden'}>
                <LoginForm />
            </Activity>
            <Activity mode={step === 'totp' ? 'visible' : 'hidden'}>
                <TOTPForm />
            </Activity>
            <Activity mode={step === 'register' ? 'visible' : 'hidden'}>
                <RegisterForm />
            </Activity>
        </div>
    )
}

function LoginForm() {
    const setStep = useStep(({ setStep }) => setStep)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    function handleCredentials() {
        startTransition(async () => {
            const res = await authClient.signIn.email({ email, password })
            console.log(res)
            setStep('totp')
        })
    }
    return (
        <Card className='w-full max-w-sm'>
            <CardHeader>
                <CardTitle>Iniciar sesión</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Field>
                    <FieldLabel htmlFor='email'>Correo</FieldLabel>
                    <Input
                        id='email'
                        type='email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
                    <Input
                        id='password'
                        type='password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </Field>
                {error && <p className='text-destructive text-sm'>{error}</p>}
            </CardContent>
            <CardFooter className='flex-col space-y-4'>
                <Button
                    className='w-full'
                    onClick={handleCredentials}
                    disabled={loading}
                >
                    Continuar
                </Button>
                <p className='text-muted-foreground text-center text-sm'>
                    ¿No tienes cuenta?{' '}
                    <button
                        className='hover:text-foreground underline underline-offset-4'
                        onClick={() => {
                            setStep('register')
                            setError(null)
                        }}
                    >
                        Regístrate
                    </button>
                </p>
            </CardFooter>
        </Card>
    )
}

function TOTPForm() {
    const setStep = useStep(({ setStep }) => setStep)
    const [totp, setTotp] = useState('')
    const [loading, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleTotp() {
        startTransition(async () => {
            const res = await authClient.twoFactor.verifyTotp({
                code: '012345',
                trustDevice: true,
            })
            console.log(res)
            setStep('totp')
            // window.location.href = '/'
        })
    }
    return (
        <Card className='max-w-sm'>
            <CardHeader>
                <CardTitle>Verificación en dos pasos</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Field>
                    <FieldLabel htmlFor='totp'>Código TOTP</FieldLabel>
                    <InputOTP
                        maxLength={6}
                        value={totp}
                        onChange={e => setTotp(e)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </Field>
                {error && <p className='text-destructive text-sm'>{error}</p>}
            </CardContent>
            <CardFooter>
                <Button
                    className='w-full'
                    onClick={handleTotp}
                    disabled={loading}
                >
                    Verificar
                </Button>
            </CardFooter>
        </Card>
    )
}

function RegisterForm() {
    const setStep = useStep(({ setStep }) => setStep)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function register() {
        startTransition(async () => {
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden')
                return
            }

            const res = await registerAction({
                email,
                name,
                password,
            })
            if (res.status === 'success') {
                toast('Te has registrado correctamente', {
                    description: 'Ahora puedes iniciar sesión',
                })
                setStep('credentials')
                return
            }
            switch (res.type) {
                case 'unknown': {
                    setError('Ha ocurrido un error')
                }
            }
        })
    }

    return (
        <Card className='w-full max-w-sm'>
            <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Field>
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel>Correo</FieldLabel>
                    <Input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel>Contraseña</FieldLabel>
                    <Input
                        type='password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel>Confirmar contraseña</FieldLabel>
                    <Input
                        type='password'
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </Field>
                {error && <p className='text-destructive text-sm'>{error}</p>}
            </CardContent>
            <CardFooter className='flex-col space-y-4'>
                <Button
                    className='w-full'
                    onClick={register}
                    disabled={loading}
                >
                    Registrarse
                </Button>
                <p className='text-muted-foreground text-center text-sm'>
                    ¿Ya tienes cuenta?{' '}
                    <button
                        className='hover:text-foreground underline underline-offset-4'
                        onClick={() => {
                            setStep('credentials')
                            setError(null)
                        }}
                    >
                        Inicia sesión
                    </button>
                </p>
            </CardFooter>
        </Card>
    )
}
