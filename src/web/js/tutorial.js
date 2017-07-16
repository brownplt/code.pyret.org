({
  requires: [],
  nativeRequires: [],
  provides: {},
  theModule: function(runtime, _, uri) {
    var steps = [
    {
      type: "fullScreen",
      title: "Programs, Values & Errors",
      text: ["Welcome to Bootstrap: DataScience. In this course, you'll learn how to ask and answer questions about data. The process of learning from data is called Data Science. ",
             "In order to ask questions from data, you will use a programming language. Just like any language (English, Spanish, French), programming languages have their own vocabulary and grammar that you will need to learn. The language you'll be learning for data science is Pyret, which lets you ask and answer questions quickly from very large data sets."
            ],
      task: [],
      previousButton: "no",
      nextButton: "always" // TODO: there could be more options here, like only appears when the answer is correct
    },
    {
      type: "halfScreen",
      title: "Programs, Values & Errors",
      text: ["This screen on the right is called the editor. There are a few buttons at the top, but most of the screen is taken up by two large boxes: the Definitions area on the left and the Interactions area on the right.",
             "For now, we will only be writing programs in the Interactions area."
            ],
      task: ["Begin by typing “4” into the Interactions area, then hit Return. You should see the value 4 appear on the next line in the Interactions area."
            ],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Programs, Values & Errors",
      text: ["Congratulations, you've written your first program!  Yes, really.  When a program is run, the editor will turn that program into a _value_. Values are how the computer represents data. In this case, the editor's job is easy because the program is already a value! When we hit Run, we _evaluate_ the program, which is another way of saying \"give me the value that is produced by this program\".",
             "Type 10 in the Interactions area and hit \"Return\".  Now the value 10 appears in the Interactions area."
            ],
      task: ["Try evaluating numbers, like 10345017, or negative numbers, like -2. Is there a limit to how big a number can be? What happens if you write a decimal? What happens when you click on a decimal, like 0.75? You get a new type of number, a fraction, like 3/4."
            ],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Programs, Values & Errors",
      text: ["All values that a computer program can produce have a type. Each of the values produced by the programs you just wrote are Numbers. Another fundamental type is String. A String is a sequence of characters (letters, numbers, symbols) in between a pair of quotation marks \"\".",
            ],
      task: [" Begin by typing \"Ahoy, World!\" into the Interactions area, then hit Return. You should see the value \"Ahoy, World!\" appear on the next line in the Interactions area.",
             "Try to type your name within a pair of quotation marks, then hit Return.",
             "CHALLENGE:  Type this program into the Interactions area:  \"4\" Is this a String or a number?",
             "CHALLENGE:  What happens when you leave off the second quotation mark?  Type this code into the Interactions area and hit Return: \"I love writing programs"
            ],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Programs, Values & Errors",
      text: ["Notice when you leave off the second quotation mark, \"I love writing programs is NOT printed on the next line;  instead, we get a big red box. This big red box is an error message. The editor gives us error messages when a program can't be properly evaluated.",
            "Error messages are really helpful, and they're a natural part of programming; they exist so that the computer can help you find small mistakes in your code. In the case above, without the second quotation mark the computer can't figure out when the end of the String is, which makes evaluation impossible."
            ],
      task: ["Fix the error described in the error messages by typing \"I love writing programs\" and hitting the Return key."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Expressions & Operations",
      text: ["We've successfully written and evaluated programs, but writing programs that only contain values would be boring. Luckily, Pyret allows us to compute new values using old values in expressions. One of the great things about Pyret is that these expressions are similar to the ones you've seen in math classes."
            ],
      task: ["Type 2 + 5 into the Interactions area, then hit Return. You should see the value 7 printed on a new line."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Expressions & Operations",
      text: ["Let's break this down. 2 + 5 is an expression, and this expression is made up of values and an operator. Here the operator is +, which is the standard addition you've seen in math classes:  adding two values to create a new value.",
             "Some of you may have gotten an error when trying to run this program. This error happened because Pyret needs you to write spaces between numbers and operators. To address this issue, add spaces between the operator and values."
            ],
      task: ["3-8",
             "1.5 * 3",
             "100 / 5",
             "8 + -2",
             "2.3 * 7",
             "6 / 0",
             "2 + \"hello\""],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Expressions & Operations",
      text: ["Notice that the last two programs give errors. We know that Pyret gives errors whenever it can't evaluate a program. Read the errors carefully, and see if you can understand why the program could not be evaluated.",
             "In 6 / 0 we know that you can't divide any number by 0! In this case, Pyret obeys the same rules as humans, and gives an error.",
             "In 2 + \"hello\", we're trying to add a String to a Number. This doesn't make sense to us, and it doesn't make sense to Pyret either; Pyret can only add Numbers to Numbers with the + operation."
            ],
      task: [],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Expressions & Operations",
      text: ["By now you've seen 4 different kinds of errors:  What are they caused by?",
             "- Leaving off quotation marks for String values",
             "- Missing whitespace between operators and values",
             "- Division by zero",
             "Adding non-Numbers to Numbers"],
      task: [],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Expressions & Operations",
      text: ["As data scientists, you will see many different error messages in this course. They are a part of using the computer as a tool to solve problems, so don't give up when you see them! The most important part of using an error message is reading the message editing the program to fix the errors.",
             "+, -, *, / all work the way they do in math class. Parentheses work pretty much the same way, but with one important exception!"
            ],
      task: ["Type (2 * 3) + 5 into the Interactions window, and hit Run. It should produce 11."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Expressions & Operations",
      text: ["Parentheses allow you to write more complex expressions. In this example, Pyret evaluates what is inside the parentheses: 2 * 3.",
             "Then, it uses this value in the larger expression. So (2 * 3) + 5 becomes 6 + 5, which is evaluated to 11.",
             "@bold{Note:} There is one difference between the way parentheses work in math class, and the way they do in Pyret! In Pyret, any time you have more than one operation, you @bold{must} include parenthesis."],
      task: ["Turn to @worksheet-link[#:name \"Expressions-Values-Errors\"] in your workbook. For each program, say whether it will produce an error or not. If itdoes not produce an error, what value will it produce?  If it does produce an error, why? The error will be a kind of error you have seen before."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Identifiers & Variables",
      text: ["You've used operations and expressions to compute new values. Now it's time to put your data science skills to their first test!",
             "For each of these word problems, write an expression in Pyret to compute the answer."],
      task: ["You want to buy two ice cream cones:  one for you, and one for a friend. Each ice cream cone costs $1.98. How much will 2 ice cream cones cost?",
             "We need to compute the cost of 2 cones, and each cone costs $1.98. So we need to multiply the cost-per-cone by the number of ice cream cones we want to buy.",
             "There 365 days in a year, 60 minutes in an hour, and 24 hours in a day. How many minutes are there in a year?",
             "You want to throw a pizza party for a class of 16 students. We need to buy one of each of these per student: @itemlist[1 Slice of Pizza : $2.50, 1 Plastic Plate : $0.20, 1 Soda : $0.98]"
            ],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Identifiers & Variables",
      text: ["Now suppose that you want to include the teacher in the pizza party (teachers like pizza too!)  How would you rewrite this program to compute the cost of paying for supplies for 16 students and 1 teacher?"],
      task: ["Rewrite your program to get the new cost of a pizza party for 17 people."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Identifiers & Variables",
      text: ["Notice how tedious it is to change each @code{16} to a @code{17}, when each number represents the same thing.  If we ever want to change the number of people at the party, we'll have to change all 3 numbers again.",
             "There has to be a better way...",
             "...and there is!  In Pyret, you can define @vocab{variable}s with the @code{=} sign, just like in math class. You're probably used to seeing variables @code{x, y, z}, etc.  In Pyret, you can use words to define variables, which will make your code readable and easy to change."],
      task: ["Add this line of code to the top of your definitions window: @code[#:multi-line #t]{how-many-people = 17}. Then, substitute all of the instances of @code{17} with @code{how-many-people} in your expression to compute the cost of the party."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Identifiers & Variables",
      text: ["Imagine we learn that a different pizza place will sell us better tasting pizza, for only $2 per slice!  We could change the @code{2.50} in our program to @code{2.00}, but what's a more readable solution?"],
      task: ["Add variable definitions at the top of your definitions window for the cost of each item we need to buy per person (@code{pizza-slice-cost, plate-cost, soda-cost}).",
             "Then, use these new variables to rewrite your old program to compute the cost of the party."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Applying Functions",
      text: ["You've probably seen numbers, variables, and operators in math classes as well as in Pyret.  These are extremely important concepts that will be used in almost all programs you write in this course.  However, there's one more important construct from math classes that is crucial to writing Pyret programs: @vocab{function}s."],
      task: ["Type @code{num-sqr(2)} into the interactions window, and hit Enter. What does this code evaluate to?  Try changing the number in between the parentheses."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Applying Functions",
      text: ["This is your first example of a function in Pyret.  Each function has: @itemlist[A name. This function's name is @code{num-sqr}. Parentheses.  A correct function usage will always have one left, and one right parentheses. Argument(s).  In this case, there is one argument:  The number we want to square.  However, different functions can have any number of arguments.]",
             "Each function also outputs a value.  The @code{num-sqr} function outputs a number that is equal to the argument times itself."],
      task: [],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Applying Functions",
      text: ["Pyret has hundreds of built in functions we can use to write more interesting programs than are possible with just operators and variables."],
      task: ["Let's explore a new function, @code{num-min}.  Type each of these lines of code into the interactions window and hit enter. @itemlist[@code{num-min(0, 1)}, @code{num-min(-5, 2)}, @code{num-min(8, 6)}]",
             "How many arguments does @code{num-min} have? What type of values does this function take in? What type of value does this function output?  How does this output relate to the arguments?"],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Applying Functions",
      text: [],
      task: ["For each of these lines of code, try to guess what the problem is based on the error messages. @itemlist[@code{num-min(2, 3}, @code{num-min(1 9)}, @code{num-min(\"hi\", 2)}, @code{num-min(1, 4, 6)}]"],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Applying Functions",
      text: ["Every successful application of @code{num-min} will take 2 Numbers as input, and evaluate to one Number.  For each function we learn, we need to keep track of what arguments it takes, and what type of value it returns."],
      task: [],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Applying Functions",
      text: ["We do this by writing @vocab{contracts}.  @vocab{Contracts} are comments in code that give the programmer instructions on what functions take in and output.",
             "Below is the contract for @code{num-min}: @code[#:multi-line #t]{# num-min : Number Number -> Number}",
             "The first part of a contract is the function name.  This function is @code{num-min}, so that part is easy.  @code{num-min} takes two arguments of type Number, so we write Number Number.  Finally, after the arrow goes the type of the function's output, which in this case is Number."],
      task: [],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Applying Functions",
      text: ["Let's write the contract for @code{num-sqr} together. @itemlist[What is the function name? How many arguments are there?  What are the types of each? What is the type of the output?] @code[#:multi-line #t]{# num-sqr : Number -> Number}"],
      task: ["Turn to @worksheet-link[#:name \"Contracts-Functions\"] in your workbook. For each set of function calls, determine the name, number of arguments, type of argument(s), and in your own words what is the output of this function."],
      previousButton: "always",
      nextButton: "always"
    },
    {
      type: "halfScreen",
      title: "Closing",
      text: ["Pat yourself on the back:  you're now officially data scientists!  By learning to use values, variables, operations and functions, you are now familiar with the fundamental concepts needed to write programs.  You will have many opportunities to use these concepts in the next units, by writing programs to answer data science questions."],
      task: ["Make sure to save your Pyret program as @code{unit-1} into your Google Drive."],
      previousButton: "always",
      nextButton: "always"
    }];


    var currentStep = 0;
    var stepWindow = $("#instruction");

    function showStep(index) {
      stepWindow.empty();
      var type = steps[index].type;
      var title = steps[index].title;
      var text = steps[index].text;
      var task = steps[index].task;
      var previousButton = steps[index].previousButton;
      var nextButton = steps[index].nextButton;


      //type
      if (type === "fullScreen") {
        stepWindow.width("100%");
        stepWindow.height("100%");
      } else if (type === "halfScreen") {
        stepWindow.width("30%"); //not exactly half, because editor looks nicer this way
        stepWindow.height("100%");
      } else {
        console.log("Unknown step type", type);
      }

      //title
      var titleElt = $("<h2>").addClass("title");
      titleElt.text(title);
      stepWindow.append(titleElt);

      //text
      for (var i=0; i<text.length; i++){
        var paragraphElt = $("<p>");
        paragraphElt.text(text[i]);
        stepWindow.append(paragraphElt);
      }

      //task
      if (task.length > 0) {
        var taskElt = $("<h2>").addClass("task");
        taskElt.text("Task");
        stepWindow.append(taskElt);
        for (var i=0; i<task.length; i++){
          var paragraphElt = $("<p>");
          paragraphElt.text(task[i]);
          stepWindow.append(paragraphElt);
        }
      }

      //previousButton
      if (previousButton === "always") {
        var preElt = $("<button>").addClass("previous");
        preElt.text("Previous");
        stepWindow.append(preElt);
        preElt.click(function() {
          currentStep -= 1;
          showStep(currentStep);
        });
      } else if (previousButton === "no") {
      } else {
        console.log("Unknown step previousButton", previousButton);
      }

      //nextButton
      if (nextButton === "always") {
        var nextElt = $("<button>").addClass("next");
        nextElt.text("Next");
        stepWindow.append(nextElt);
        nextElt.click(function() {
          currentStep += 1;
          showStep(currentStep);
        });
      } else {
        console.log("Unknown step nextButton", nextButton);
      }

      //for debug purpose, a page jump button
      var pageJump = $("<input>");
      stepWindow.append(pageJump);
      var jumpElt = $("<button>").addClass("jump");
      jumpElt.text("Jump to page");
      stepWindow.append(jumpElt);
      jumpElt.click(function() {
        currentStep = pageJump.val();
        showStep(currentStep);
      });
    }

    showStep(currentStep);



// this is a little test function to make sure steps can interact with editor
     function afterRun(answer){
       console.log("in afterRun");
       var returnAnswer = $("<span>");
       returnAnswer.text(answer);
       $("#instruction").append(returnAnswer);
     }
    return runtime.makeJSModuleReturn({
      afterRun: afterRun
    });
  }
})
