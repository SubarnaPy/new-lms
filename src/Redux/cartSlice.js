import { createSlice } from "@reduxjs/toolkit"
import { toast } from "react-hot-toast"

const initialState = {
  cart: JSON.parse(localStorage.getItem("cart")) || [],
  total: Number(localStorage.getItem("total")) || 0, // Ensure total is a number
  totalItems: Number(localStorage.getItem("totalItems")) || 0, // Ensure totalItems is a number
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const course = action.payload
      const index = state.cart.findIndex((item) => item._id === course._id)

      if (index >= 0) {
        toast.error("Course already in cart")
        return
      }

      state.cart.push(course)
      console.log("Course added", course.price)

      // Ensure price is treated as a number
      state.totalItems++
      state.total += Number(course.price)

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(state.cart))
      localStorage.setItem("total", JSON.stringify(state.total)) // Store as string but retrieve as number
      localStorage.setItem("totalItems", JSON.stringify(state.totalItems))

      toast.success("Course added to cart")
    },
    removeFromCart: (state, action) => {
      const courseId = action.payload
      const index = state.cart.findIndex((item) => item._id === courseId)

      if (index >= 0) {
        state.totalItems--
        state.total -= Number(state.cart[index].price) // Ensure price is treated as a number
        state.cart.splice(index, 1)

        localStorage.setItem("cart", JSON.stringify(state.cart))
        localStorage.setItem("total", JSON.stringify(state.total))
        localStorage.setItem("totalItems", JSON.stringify(state.totalItems))

        toast.success("Course removed from cart")
      }
    },
    resetCart: (state) => {
      state.cart = []
      state.total = 0
      state.totalItems = 0

      localStorage.removeItem("cart")
      localStorage.removeItem("total")
      localStorage.removeItem("totalItems")
    },
  },
})

export const { addToCart, removeFromCart, resetCart } = cartSlice.actions
export default cartSlice.reducer
