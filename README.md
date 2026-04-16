# Make-A-Ton

A point-and-click game to save the penguin for people interested in saving the world from climate change.

## Overview

Users can play this game to try for higher scores with the core gameplay loop of clicking at melting ice caps. If any one ice cap fully melts, the user loses. If the user can prevent any complete meltdowns, their score is decided based on the amount of ice caps they succeeded in keeping fully frozen, as opposed to the ones left partially frozen.

## Main Features

The main features of the game Ice To Meet You include clicking at ice caps to freeze them, using an ability on cooldown to freeze multiple ice caps at once, and being able to restart the game if it isn't going well.

## Tech and Assets

The game uses primarily React paired with CSS. There are various sound effects reacting to different input, all royalty free and downloaded from [Pixabay](https://pixabay.com/).
The OST playing during gameplay was produced in FL Studio.
Visual asset images were made with use of Affinity.

## Visual Style

The approach to styling was going for a pixelated, retro-style for a lighthearted feel. This was accomplished through avoiding excessive use of border radius, and using harsh box shadows. In addition, the text present follows the theme with use of a pixelated font. [Bytesized](https://fonts.google.com/specimen/Bytesized?query=pixel&preview.script=Latn) for headings and [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans?query=pixel) for regular reading text.
Alongside those decisions, to fit the setting which the game revolves around, it is ensured that the color scheme is coordinated to follow a directly icy feel, using blues and whites.

## Controls and Win/Loss Conditions

The game is controlled using the user's mouse and left click, with no need for other inputs. The mouse can be dragged across the screen to click on all interactable elements.
It is won when the user can make it through the timer without letting any ice caps fully melt. A loss occurs when a singular ice cap melts to completion. When the game is won, the score is decided via a count of how many ice caps were kept fully frozen.
When in a game, the stop button can be clicked to pause the timer. There are then three options, either resuming, or restarting which switches up the ice cap layout and makes the timer play from the beginning, or the main menu button to quit the match and return to the menu.

## Project Structure

The project is laid out in the React boilerplate, with some additional folders. Within the src, there is an additional folder for components, and a pair folder for the styles used by the aforementioned components.
Within the logic folder, JavaScript files live to serve the game configuration, logic, and audio handling.
For audio, there are two separate folders: a Music folder, containing the OST file, and an SFX folder, containing the sound effects.