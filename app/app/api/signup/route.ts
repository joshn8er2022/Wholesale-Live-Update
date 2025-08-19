
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, companyName, role = 'CLIENT' } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, password, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Validate role
    const validRole = role === 'ADMIN' ? UserRole.ADMIN : UserRole.CLIENT

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        companyName: companyName || '',
        role: validRole,
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
