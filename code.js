figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'resize') {
    figma.ui.resize(msg.width, msg.height);
  } else if (msg.type === 'create-bug') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        throw new Error('No object selected. Please select an object.');
      }

      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });

      for (const selectedObject of selection) {
        let absoluteX = selectedObject.x;
        let absoluteY = selectedObject.y;
        let parent = selectedObject.parent;
        while (parent && parent.type !== 'PAGE') {
          absoluteX += parent.x;
          absoluteY += parent.y;
          parent = parent.parent;
        }

        const newFrame = figma.createFrame();
        newFrame.name = "DESIGN BUG";
        newFrame.resize(200, 1); // Initial size, will be adjusted by auto layout
        newFrame.layoutMode = "VERTICAL";
        newFrame.primaryAxisSizingMode = "AUTO";
        newFrame.counterAxisSizingMode = "FIXED";
        newFrame.itemSpacing = 8;
        newFrame.paddingTop = 16;
        newFrame.paddingRight = 16;
        newFrame.paddingBottom = 16;
        newFrame.paddingLeft = 16;
        
        // Set up the bug report frame
        newFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        newFrame.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
        newFrame.strokeWeight = 1;
        newFrame.cornerRadius = 4;

        // Add bug icon and title
        const titleText = figma.createText();
        titleText.characters = "🐞 " + msg.bugData.name;
        titleText.fontSize = 12;
        titleText.fontName = { family: "Inter", style: "Medium" };
        titleText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
        titleText.layoutAlign = "STRETCH";
        newFrame.appendChild(titleText);

        // Add description text
        const descriptionText = figma.createText();
        descriptionText.characters = msg.bugData.description;
        descriptionText.fontSize = 10;
        descriptionText.fontName = { family: "Inter", style: "Regular" };
        descriptionText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
        descriptionText.layoutAlign = "STRETCH";
        descriptionText.textAutoResize = "HEIGHT";
        newFrame.appendChild(descriptionText);

        // Position the new frame based on the selected position
        switch (msg.bugData.position) {
          case 'top':
            newFrame.x = absoluteX;
            newFrame.y = absoluteY - newFrame.height - 60;
            break;
          case 'right':
            newFrame.x = absoluteX + selectedObject.width + 60;
            newFrame.y = absoluteY;
            break;
          case 'bottom':
            newFrame.x = absoluteX;
            newFrame.y = absoluteY + selectedObject.height + 60;
            break;
          case 'left':
            newFrame.x = absoluteX - newFrame.width - 60;
            newFrame.y = absoluteY;
            break;
        }

        figma.currentPage.appendChild(newFrame);
      }
      
      figma.notify("Bug report created!");
    } catch (error) {
      figma.notify(`Error: ${error.message}`, {error: true});
    }
  }
};