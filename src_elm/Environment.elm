module Environment where

Model : List Shape

type Action
  = MouseDrag (X, Y) --should update active item
  | MouseDown (X, Y, Modifiers) --should mark active item
  | MouseUp
  | Add (X, Y, Color)
  | Remove (X, Y)
  | Clone (X, Y)
  | BringToTop (X, Y)

update: Action -> Model -> Model

view: Model -> Html
