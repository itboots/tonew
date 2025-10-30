// Mock auth for demonstration purposes
export const auth = async () => {
  // Return a mock user for demonstration
  return {
    user: {
      id: "demo-user",
      email: "demo@example.com",
      name: "Demo User"
    }
  }
}

export const signIn = async () => {
  console.log("Mock sign in")
}

export const signOut = async () => {
  console.log("Mock sign out")
}