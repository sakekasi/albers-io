import StartApp.Simple as StartApp
import Color exposing (Color)
import ColorSwatch

main =
  StartApp.start { model = Color.orange
                 , view = ColorSwatch.view
                 , update = ColorSwatch.update}
