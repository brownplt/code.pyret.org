({
  requires: [],
  nativeRequires: [],
  provides: {},
  theModule: function(runtime, _, uri) {

    var stepWindow = $("#instruction");

    var first = $("<span class=\"time\">(Time 15 minutes)<\/span>\r\n\r\n<\/span><p><\/p><\/span><ul class=\"lesson\"><li class=\"lessonItem\"><div class=\"student\"><p><div class=\"SIntrapara\"><span class=\"slideText\"><span class=\"BootstrapSlideTitle\">Introduction<\/span><\/span>Welcome to Bootstrap: DataScience! Take 30 seconds to look at the <a href=\"..\/..\/resources\/OpeningQuestions.pdf\" target=\"_blank\">opening questions<\/a> we have prepared for you, and choose a topic that interests you.\r\n<\/div><div class=\"SIntrapara\"><div class=\"activity not-in-repl\"><ul><li><p>Once you&rsquo;ve selected your topic, break into groups of no more than 4 and choose a question you&rsquo;d like to answer.<\/p><\/li><li><p>Spend one minute discussing your answer, and explaining <span style=\"font-style: italic\">why<\/span> you answered the way you did. Does everyone in your group have the same answer? Why or why not?<\/p><\/li><li><p>What kind of <span style=\"font-style: italic\">measurement<\/span> would you use to determine if your answer is right or not? What data would you need?<\/p><\/li><li><p>Take 5 minutes to complete Page 1 in your Student Workbook, by copying down the question, your answer, and what you discussed with your group.<\/p><\/li><\/ul><\/div><\/div><\/p><\/div><div class=\"teacher\"><p>Have students self-select into groups (no larger than 4), with each group choosing an Opening Question (or writing their own). After they&rsquo;ve had time to discuss, have a few students share back what they talked about.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>What&rsquo;s the greatest movie of all time? The best quaterback? Is Stop-and-Frisk racially biased? These questions quickly turn into a discussion about data - how you measure it and how you interpret the results. In this course, you&rsquo;ll learn how to use data to ask and answer questions like this.  The process of learning from data is called <span class=\"vocab\">Data Science<\/span>. Data science techniques are used by scientists, business people, politicians, sports analysts, and hundereds of other different fields to ask and answer questions about data.<\/p><\/div><div class=\"teacher\"><p>You can motivate relevance of data science by using additional examples that relate to student interests.  Here are a few:<\/p><ul><li><p><a href=\"http:\/\/motherboard.vice.com\/read\/a-data-scientists-emoji-guide-to-kanye-west-and-taylor-swift\">Emojis<\/a><\/p><\/li><li><p><a href=\"https:\/\/mic.com\/articles\/131092\/these-students-are-using-data-science-to-predict-which-rap-songs-will-become-hits#.0d3wkhxQE\">Pop Music<\/a><\/p><\/li><li><p><a href=\"http:\/\/www.kdnuggets.com\/2016\/06\/politics-analytics-trump-clinton-sanders-twitter-sentiment.html\">Election Analysis<\/a><\/p><\/li><li><p><a href=\"http:\/\/fivethirtyeight.com\/\">Polling<\/a><\/p><\/li><li><p><a href=\"http:\/\/games.espn.com\/fba\/tools\/projections\">Predicting Sports Performance<\/a><\/p><\/li><li><p><a href=\"http:\/\/www.salon.com\/2015\/07\/18\/how_big_data_can_help_save_the_environment_partner\/\">Environmental<\/a><\/p><\/li><\/ul><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>In order to ask questions from data, we&rsquo;ll use a <span class=\"vocab\">programming language<\/span>. Just like any human language (English, Spanish, French), programming languages have their own vocabulary and grammar that you will need to learn. The language you&rsquo;ll be learning for data science is called <span style=\"font-style: italic\">Pyret<\/span>.<\/p><\/div><div class=\"teacher\"><p>Set expectations for the class.  This course is an introduction to programming and data science, so some of the questions students want to answer may be out of scope.  However, this course will give students a foundation to answer their more complicated questions later in their data science education.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Begin by opening a web browser, and going to <a href=\"http:\/\/code.pyret.org\">The Pyret Editor<\/a>. Hit the \"log in\" button, and sign in with your Google account information, then choose \"Start Coding\".<\/p><\/div><div class=\"teacher\"><p>Each student (or pair of students) should have a Google Account.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p><img src=\"pict_2.png\" alt=\"image\" width=\"200\" height=\"150\"\/>\r\nThis screen is called the <span class=\"vocab\">editor<\/span>, and it looks something like the diagram you see here. There are a few buttons at the top, but most of the screen is taken up by two large boxes: the <span class=\"vocab\">Definitions area<\/span> on the left and the <span class=\"vocab\">Interactions area<\/span> on the right.<\/p><p>For now, we will only be writing programs in the Interactions area.<\/p><\/div><div class=\"teacher\"><p>The Definitions Area is where programmers define values and functions in their program, while the Interactions Area allows them to experiment with those values and functions. This is analogous to writing a series of function definitions on a blackboard, and having student evaluate expressions using those function on scrap paper. As students are not yet defining values of their own, it is not important that students understand this distinction right now.  For now, we will work only with the Interactions area.<\/p><\/div><\/li><\/ul><\/div><\/div><\/blockquote><blockquote class=\"LessonBoundary\"><div class=\"BootstrapPageTitle\">Numbers, Strings &amp; Operators<\/div><div class=\"content\"><div class=\"overview\"><span class=\"BootstrapLogo\"><p><img src=\"logo.png\" alt=\"bootstrap logo\" width=\"150\" height=\"150\"\/><\/p><\/span><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><p>Overview<\/p><\/span><\/span><div class=\"LessonLearningObjectives\"><p><span style=\"font-weight: bold\">Learning Objectives<\/span><\/p><ul><\/ul><\/div><div class=\"LessonEvidenceStatementes\"><p><span style=\"font-weight: bold\">Evidence Statementes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonProductOutcomes\"><p><span style=\"font-weight: bold\">Product Outcomes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonMaterials\"><p><span style=\"font-weight: bold\">Materials<\/span><\/p><ul><\/ul><\/div><div class=\"LessonPreparation\"><p><span style=\"font-weight: bold\">Preparation<\/span><\/p><ul><\/ul><\/div><\/div><div class=\"segment\"><p><a name=\"lesson_Numbers%2CStrings%26Operators8771\"><\/a><span><\/span><\/p><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><span class=\"Slide-Lesson-Title\">Numbers, Strings &amp; Operators<\/span>\r\n\r\n\r\n\r\n<span class=\"time\">(Time 15 minutes)<\/span>\r\n\r\n<\/span><p><\/p><\/span><ul class=\"lesson\"><li class=\"lessonItem\"><div class=\"student\"><p><div class=\"SIntrapara\"><span class=\"slideText\"><span class=\"BootstrapSlideTitle\">Numbers, Strings &amp; Operators<\/span><\/span><\/div><div class=\"SIntrapara\"><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>4<\/p><\/div><p>Begin by typing <\/p><p><tt class=\"pyret\">4<\/tt><\/p><p> into the Interactions area, then hit<\/p><p>Return.  You should see the value 4 appear on<\/p><p>the next line in the Interactions area.<\/p><\/div><\/div><\/p><p>Congratulations, you&rsquo;ve written your first (very simple) program!  When a program is run, the computer will run that program to produce a <span class=\"vocab\">value<\/span>.  Values are how the computer represents\r\ndata.  In this case, the computer&rsquo;s job is easy because the program is already a value!  When we hit Run, we <span class=\"vocab\">evaluate<\/span> the program, which is another way of saying \"give me the value that is produced by this program\".<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity predicate\"><div class=\"activityanswer\"><p>(function(x) {return ((x &gt; 10000) || (x &lt; 0) || ((x &gt; 0) &amp;&amp; (x &lt; 1)))})<\/p><\/div><ul><li><p>Type 10 in the Interactions area and hit \"Return\".  Now the\r\nvalue <tt class=\"pyret\">10<\/tt> appears in the Interactions area.<\/p><\/li><li><p>Try evaluating numbers, like <tt class=\"pyret\">10345017<\/tt>, or negative\r\nnumbers, like <tt class=\"pyret\">-2<\/tt>. Is there a limit to how big a number can be?\r\nWhat happens if you write a decimal? What happens when you click on\r\na decimal, like <tt class=\"pyret\">0.75<\/tt>? You get a new type of number, a\r\nfraction, like <tt class=\"pyret\">3\/4<\/tt>.<\/p><\/li><\/ul><\/div><\/div><div class=\"teacher\"><p>The editing environment evaluates all fractions and returns them as decimals by default. This can be\r\nsurprising to students at first, so you may want to take a moment to explain what&rsquo;s going on, and\r\nshow them that these decimals can be converted back to fractions just by clicking on them.  The\r\nenvironment uses standard annotations for repeating, non-terminating decimal expressions and\r\nproperly handles expressions like <script type=\"math\/tex\">(\\sqrt -1)<\/script>.  If you want to work with those kinds of\r\nnumbers in your class, enter them to get familiar with how they appear in the Interactions area.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Every value has a  <span class=\"vocab\">Type<\/span>.  Each of the values produced by the programs you just wrote are Numbers, but there are other types as well. One of these types is called a <span class=\"vocab\">String<\/span>.  A String\r\nis a sequence of characters (letters, numbers, symbols) in between a pair of quotation marks.<\/p><div class=\"activity multi-parts\"><div class=\"activityanswer\"><p>TODO<\/p><\/div><ul><li><p>Begin by typing <tt class=\"pyret\">\"Ahoy, World!\"<\/tt> into the Interactions area, then hit\r\nReturn.  You should see the value \"Ahoy, World!\" appear on\r\nthe next line in the Interactions area.<\/p><\/li><li><p>Try to type your name within a pair of quotation marks, then hit Return.<\/p><\/li><li><p>What do you notice about the way Pyret displays Strings on the screen?<\/p><\/li><li><p>Type this program into the Interactions area:  <tt class=\"pyret\">\"4\"<\/tt>. Is this a String or a number?<\/p><\/li><li><p>What happens when you leave off the second quotation mark?  Type this code into the Interactions area and hit Return: <tt class=\"pyret\">\"I love writing programs<\/tt><\/p><\/li><\/ul><\/div><\/div><div class=\"teacher\"><p>The program <tt class=\"pyret\">\"4\"<\/tt> is a String.  Even though this string only contains the character for the number 4,\r\nit is a String because it is between quotation marks.  Data scientists care about this distinction, because\r\nwe often run into data that is represented in a String but should be considered a number by Pyret.  This will\r\nbecome more relevant later in the course, for now stress to the students that anything within quotations is\r\na String.  Pyret is helpful in detecting strings because it highlights them green.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Notice when you leave off the second quotation mark, <tt class=\"pyret\">\"I love writing programs<\/tt> is NOT\r\nprinted on the next line;  instead, we get a big red box.  This big red box is an <span class=\"vocab\">error message<\/span>.\r\nThe editor gives us error messages when a program can&rsquo;t be properly evaluated.<\/p><p>Error messages a way for the computer to help you find\r\nsmall mistakes in your code.  In the case above,\r\nwithout the second quotation mark the computer can&rsquo;t figure out when the end of the String is, which makes\r\nevaluation impossible.<\/p><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>\"I love writing programs\"<\/p><\/div><p>Fix the error described in the error messages by typing <\/p><p><tt class=\"pyret\">\"I love writing programs\"<\/tt><\/p><p>and hitting the Return key.<\/p><\/div><\/div><div class=\"teacher\"><p>It is crucial to encourage students to read error messages and debug their code.  Often, when a student\r\nencounters an error message for the first time, they will throw their hand up and tell the teacher\r\n\"I did something wrong\".  When helping students with this, make sure to ask questions about the answer\r\nrather than fixing code for them.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>We&rsquo;ve successfully written and evaluated programs, but writing programs that only just repeat values would be boring.  Luckily, Pyret allows us to <span style=\"font-style: italic\">compute<\/span> values using <span class=\"vocab\">expression<\/span>s.  One of the great things about Pyret is that these expressions are similar to the ones you&rsquo;ve seen\r\nin math classes.<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>7<\/p><\/div><p>Type <\/p><p><tt class=\"pyret\">2 + 5<\/tt><\/p><p> into the Interactions area. Notice the spaces between the numbers and the plus sign! Then hit Return.  You should see the value <\/p><p><tt class=\"pyret\">7<\/tt><\/p><p> printed on a new line.<\/p><\/div><\/div><div class=\"teacher\"><p>Some students may encounter syntax errors because they did not put white space between the values and the operator.  We address this error in the next point.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Let&rsquo;s break this down.  <tt class=\"pyret\">2 + 5<\/tt> is an expression, and this expression is made up of values\r\nand an <span class=\"vocab\">operator<\/span>.  Here the operator is +, which you&rsquo;ve seen in math classes:  adding two values to create a new value.<\/p><p>Now try leaving out the spaces around the plus sign. We get an error! This error happened because Pyret needs you to write spaces between numbers and operators.<\/p><\/div><div class=\"teacher\"><p>Pyret requires this whitespace for code readability, and to remove ambiguity when dealing with negative numbers.  For example, without the white space rule, the program <tt class=\"pyret\">5+-2<\/tt> is hard to understand.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity not-in-repl\"><p>What other operations can we use?  Type each of these programs into the Interactions area. If you get an error message, read it out loud and see if you can figure out what it means.<\/p><ul><li><p><tt class=\"pyret\">3 - 8<\/tt><\/p><\/li><li><p><tt class=\"pyret\">1.5 * 3<\/tt><\/p><\/li><li><p><tt class=\"pyret\">100 \/ 5<\/tt><\/p><\/li><li><p><tt class=\"pyret\">8 + -2<\/tt><\/p><\/li><li><p><tt class=\"pyret\">2.3 * 7<\/tt><\/p><\/li><li><p><tt class=\"pyret\">6 \/ 0<\/tt><\/p><\/li><li><p><tt class=\"pyret\">2 + \"hello\"<\/tt><\/p><\/li><\/ul><\/div><\/div><div class=\"teacher\"><p>Each of these programs should compile and execute correctly except for the last two, which\r\nshould raise errors.  Possible errors for the other programs should be whitespace\/syntax related.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Notice that the last two programs give errors.  We know that Pyret gives errors whenever it can&rsquo;t evaluate a program.<\/p><ul><li><p>In <tt class=\"pyret\">6 \/ 0<\/tt> we know that you can&rsquo;t divide any number by 0!  In this case,\r\nPyret obeys the same rules as humans, and gives an error.<\/p><\/li><li><p>In <tt class=\"pyret\">2 + \"hello\"<\/tt>, we&rsquo;re trying to add a String to a Number.  This doesn&rsquo;t\r\nmake sense to us, and it doesn&rsquo;t make sense to Pyret either;  Pyret can only add\r\nNumbers to Numbers with the + operation.<\/p><\/li><\/ul><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>By now you&rsquo;ve seen 4 different kinds of errors:  What are they caused by?<\/p><ul><li><p>Leaving off quotation marks for String values<\/p><\/li><li><p>Missing whitespace between operators and values<\/p><\/li><li><p>Division by zero<\/p><\/li><li><p>Adding non-Numbers to Numbers.<\/p><\/li><\/ul><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p><div class=\"SIntrapara\">Error messages are the computer&rsquo;s way of giving you a hint on what went wrong. The most important part of using an error message is reading the message editing the program to fix the errors.\r\n<\/div><div class=\"SIntrapara\"><div class=\"activity not-in-repl\"><p>Turn to <\/p><p><a href=\"..\/..\/resources\/workbook\/StudentWorkbook.pdf\" target=\"_blank\">Page 1<\/a><\/p><p> in your student workbook, and identify whether the expressions you see will produce an error or a value. In either case, write the resulting value or error messages that you think the computer will respond with.<\/p><\/div><\/div><\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p><tt class=\"pyret\">+<\/tt>, <tt class=\"pyret\">-<\/tt>, <tt class=\"pyret\">*<\/tt>, <tt class=\"pyret\">\/<\/tt> all work the way they do in math class. Parentheses work pretty much the same way, but with one\r\nimportant exception!<\/p><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>11<\/p><\/div><p>Type <\/p><p><tt class=\"pyret\">(2 * 3) + 5<\/tt><\/p><p> into the Interactions area, and hit Run.  It should produce 11.<\/p><\/div><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Parentheses allow you to write more complex expressions.  In this example, Pyret evaluates what is inside the parentheses: <tt class=\"pyret\">2 * 3<\/tt>. Then, it uses this value in the larger expression.  So <tt class=\"pyret\">(2 * 3) + 5<\/tt> becomes <tt class=\"pyret\">6 + 5<\/tt>, which is evaluated to 11.  <span style=\"font-weight: bold\">Note:<\/span> There is one difference between the way parentheses work in math class, and the way they do in Pyret! <span style=\"font-style: italic\">In Pyret, any time you have more than one operation, you must include parentheses.<\/span><\/p><\/div><div class=\"teacher\"><\/div><\/li><\/ul><\/div><\/div><\/blockquote><blockquote class=\"LessonBoundary\"><div class=\"BootstrapPageTitle\">Defining Variables<\/div><div class=\"content\"><div class=\"overview\"><span class=\"BootstrapLogo\"><p><img src=\"logo.png\" alt=\"bootstrap logo\" width=\"150\" height=\"150\"\/><\/p><\/span><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><p>Overview<\/p><\/span><\/span><div class=\"LessonLearningObjectives\"><p><span style=\"font-weight: bold\">Learning Objectives<\/span><\/p><ul><\/ul><\/div><div class=\"LessonEvidenceStatementes\"><p><span style=\"font-weight: bold\">Evidence Statementes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonProductOutcomes\"><p><span style=\"font-weight: bold\">Product Outcomes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonMaterials\"><p><span style=\"font-weight: bold\">Materials<\/span><\/p><ul><\/ul><\/div><div class=\"LessonPreparation\"><p><span style=\"font-weight: bold\">Preparation<\/span><\/p><ul><\/ul><\/div><\/div><div class=\"segment\"><p><a name=\"lesson_DefiningVariables8772\"><\/a><span><\/span><\/p><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><span class=\"Slide-Lesson-Title\">Defining Variables<\/span>\r\n\r\n\r\n\r\n<span class=\"time\">(Time 20 minutes)<\/span>\r\n\r\n<\/span><p><\/p><\/span><ul class=\"lesson\"><li class=\"lessonItem\"><div class=\"student\"><p><span class=\"slideText\"><span class=\"BootstrapSlideTitle\">Defining Variables<\/span><\/span>In Pyret, you can define <span class=\"vocab\">variable<\/span>s with the <tt class=\"pyret\">=<\/tt> sign, just like in math class. You&rsquo;re probably used to seeing variables <tt class=\"pyret\">x, y, z<\/tt>, etc.  In Pyret, you can name values to them easier to remember and easy to change.<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>58.88<\/p><\/div><p>Suppose you want to throw a pizza party for a class of 16 students. We need to buy one of each of these per student:<\/p><ul><li><p>1 Slice of Pizza : $2.50<\/p><\/li><li><p>1 Plastic Plate : $0.20<\/p><\/li><li><p>1 Soda : $0.98<\/p><\/li><\/ul><p>What code would you write, to compute the total cost of the party?<\/p><\/div><\/div><div class=\"teacher\"><ul><li><p>The particular items for the party do not matter, feel free to change them as long as they are supplies where each student gets one of each item, or change the number of students to be the number of students in your class.<\/p><\/li><\/ul><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Now suppose that you want to include the teacher in the pizza party (teachers like\r\npizza too!)  How would you rewrite this program to compute the cost of paying\r\nfor supplies for 16 students and 1 teacher?<\/p><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>62.56<\/p><\/div><p>Rewrite your program to get the new cost of a pizza party for 17 people.<\/p><\/div><\/div><div class=\"teacher\"><p>Force students to manually change each <tt class=\"pyret\">16<\/tt> to a <tt class=\"pyret\">17<\/tt>.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>62.56<\/p><\/div><p>Add this line of code to the top of your definitions area:<\/p><p>&nbsp;<textarea class=\"pyret\">\r\nparty-people = 17\r\n<\/textarea><\/p><p>Then, substitute all of the instances of <\/p><p><tt class=\"pyret\">17<\/tt><\/p><p> with <\/p><p><tt class=\"pyret\">party-people<\/tt><\/p><p> in your expression to compute the cost of the party.<\/p><\/div><\/div><div class=\"teacher\"><p>Make students compute the cost of throwing a pizza party for 20 people.  Ask them which line they need to update for this party size, and highlight the ease of editing this program vs. the previous one.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity single-answer\"><div class=\"activityanswer\"><p>243.75<\/p><\/div><p>Use identifiers to program the following word problem: A train is moving at a constant speed of 65mph. How far has it gone in 3.75 hours?<\/p><\/div><\/div><div class=\"teacher\"><p>Students should use identifiers for <tt class=\"pyret\">speed<\/tt> and <tt class=\"pyret\">time<\/tt>.<\/p><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity not-in-repl\"><p>Turn to <\/p><p><a href=\"..\/..\/resources\/workbook\/StudentWorkbook.pdf\" target=\"_blank\">Page 1<\/a><\/p><p> in your workbook.   For each expression, write down the value the computer will return. If the expression will result in an error, write down what you think the error will say.<\/p><\/div><\/div><div class=\"teacher\"><\/div><\/li><\/ul><\/div><\/div><\/blockquote><blockquote class=\"LessonBoundary\"><div class=\"BootstrapPageTitle\">Functions<\/div><div class=\"content\"><div class=\"overview\"><span class=\"BootstrapLogo\"><p><img src=\"logo.png\" alt=\"bootstrap logo\" width=\"150\" height=\"150\"\/><\/p><\/span><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><p>Overview<\/p><\/span><\/span><div class=\"LessonLearningObjectives\"><p><span style=\"font-weight: bold\">Learning Objectives<\/span><\/p><ul><\/ul><\/div><div class=\"LessonEvidenceStatementes\"><p><span style=\"font-weight: bold\">Evidence Statementes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonProductOutcomes\"><p><span style=\"font-weight: bold\">Product Outcomes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonMaterials\"><p><span style=\"font-weight: bold\">Materials<\/span><\/p><ul><\/ul><\/div><div class=\"LessonPreparation\"><p><span style=\"font-weight: bold\">Preparation<\/span><\/p><ul><\/ul><\/div><\/div><div class=\"segment\"><p><a name=\"lesson_Functions8773\"><\/a><span><\/span><\/p><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><span class=\"Slide-Lesson-Title\">Functions<\/span>\r\n\r\n\r\n\r\n<span class=\"time\">(Time 25 minutes)<\/span>\r\n\r\n<\/span><p><\/p><\/span><ul class=\"lesson\"><li class=\"lessonItem\"><div class=\"student\"><p><span class=\"slideText\"><span class=\"BootstrapSlideTitle\">Functions<\/span><\/span>So now you know about Numbers, Strings, Operators and Variables - all of which behave just like they do in math. But what about functions? Pyret has lots of built in functions, which we can use to write more interesting programs than are possible with just operators and variables.<\/p><div class=\"activity multi-parts\"><div class=\"activityanswer\"><p>TODO<\/p><\/div><p>Let&rsquo;s explore a new function, <\/p><p><tt class=\"pyret\">num-min<\/tt><\/p><p>.  Type each of these<\/p><p>lines of code into the interactions area and hit enter.<\/p><ul><li><p><tt class=\"pyret\">num-min(0, 1)<\/tt><\/p><\/li><li><p><tt class=\"pyret\">num-min(-5, 2)<\/tt><\/p><\/li><li><p><tt class=\"pyret\">num-min(8, 6)<\/tt><\/p><\/li><\/ul><p>The values that we give to a function are called it&rsquo;s <\/p><p><span class=\"vocab\">arguments<\/span><\/p><p>. How many arguments are we giving to <\/p><p><tt class=\"pyret\">num-min<\/tt><\/p><p> in the three examples above? What are the types of these arguments? What type of value does this function output?  How does this output relate to the two inputs?<\/p><\/div><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>This is your first example of <span style=\"font-style: italic\">using a function<\/span> in Pyret. To use a function, a programmer writes:<\/p><ul><li><p>The name of the function.  This function&rsquo;s name is <tt class=\"pyret\">num-sqr<\/tt><\/p><\/li><li><p>The argument(s) we want to give to the function, wrapped in parentheses and separated by commas.  In this case, there is one argument:  The number we want to square.  However, different functions can have differents numbers of arguments.<\/p><\/li><\/ul><p>Each function also outputs a value.  The <tt class=\"pyret\">num-sqr<\/tt> function outputs a number that is equal to the square of the argument. What do you think the function <tt class=\"pyret\">num-sqrt<\/tt> does?<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity not-in-repl\"><p>For each of these lines of code, try to guess what<\/p><p>the problem is based on the error messages.<\/p><ul><li><p><tt class=\"pyret\">num-min(2, 3<\/tt><\/p><\/li><li><p><tt class=\"pyret\">num-min(1 9)<\/tt><\/p><\/li><li><p><tt class=\"pyret\">num-min(\"hi\", 2)<\/tt><\/p><\/li><li><p><tt class=\"pyret\">num-min(1, 4, 6)<\/tt><\/p><\/li><\/ul><\/div><\/div><div class=\"teacher\"><p>Explanations for each error message:<\/p><ul><li><p>Pyret needs both parentheses around the arguments, so that\r\nit knows exactly where function call begins and ends.  This\r\nis similar to the error with Strings needing both quotation\r\nmarks.<\/p><\/li><li><p>For a similar reason, Pyret needs a comma between each argument\r\nso that it can tell how many arguments there are.<\/p><\/li><li><p><tt class=\"pyret\">num-min<\/tt> returns the minimum between the two numbers\r\nthat are given as arguments.  It can&rsquo;t compare a String \"hi\"\r\nto a number, so an error is raised.<\/p><\/li><li><p>Functions need to be called with the exact number of arguments\r\nit is expecting.  <tt class=\"pyret\">num-min<\/tt> takes two arguments, so calling\r\nit with 1, 3, 4, 5 etc. will give an error.<\/p><\/li><\/ul><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Every successful application of <tt class=\"pyret\">num-min<\/tt> will take 2 Numbers as input, and evaluate to one Number.  For each function we learn, we need to keep track of what arguments it takes, and what type of value it returns.<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>We do this by writing <span class=\"vocab\">contracts<\/span>. Contracts are comments in code that give the programmer instructions on what functions take in and output.  Below is the contract for <tt class=\"pyret\">num-min<\/tt>:<\/p><p>&nbsp;<textarea class=\"pyret\">\r\n# num-min :: Number, Number -&gt; Number\r\n<\/textarea><\/p><p><div class=\"SIntrapara\">The first part of a contract is the function name.  This function is <tt class=\"pyret\">num-min<\/tt>, so that part is easy.  <tt class=\"pyret\">num-min<\/tt> takes two arguments of type Number, so we write Number Number.  Finally, after the arrow goes the type of the function&rsquo;s output, which in this case is Number.\r\n<\/div><div class=\"SIntrapara\"><div class=\"activity not-in-repl\"><p>Write the contract for <\/p><p><tt class=\"pyret\">num-min<\/tt><\/p><p> in the back of your workbook. What do you think the contract would be for <\/p><p><tt class=\"pyret\">num-max<\/tt><\/p><p>? Write it down, and then try using it in the Interactions area.<\/p><\/div><\/div><\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>There are also plenty of functions you know from math class. Let&rsquo;s write the contract for <tt class=\"pyret\">num-sqrt<\/tt> together.<\/p><ul><li><p>What is the function name?<\/p><\/li><li><p>How many arguments are there?  What are the types of each?<\/p><\/li><li><p>What is the type of the output?<\/p><\/li><\/ul><p>&nbsp;<textarea class=\"pyret\">\r\n# num-sqrt :: Number -&gt; Number\r\n<\/textarea>\r\nOn your own, write the contract for <tt class=\"pyret\">num-sqr<\/tt>.<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><div class=\"activity not-in-repl\"><p>Turn to the last page in your workbook.  For each set of function calls, write the complete contract for the function, as well as an example of how to use it.<\/p><\/div><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Pyret has many, many more functions. Some of these functions are defined as part of the language, and others are defined in extra files that we have to load by hand. Fortunately, including an external file is really easy! Try typing in the following code at the top of the Definitions Area:\r\n&nbsp;<textarea class=\"pyret\">\r\ninclude plot-list\r\n<\/textarea>\r\nThis includes a file called <tt class=\"pyret\">plot-list<\/tt>, which defines a lot of extra functions for drawing charts, graphs and plots. When you click Run, Pyret will read that file and become aware of all those plotting functions.<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>Two functions imported by this file are called <tt class=\"pyret\">function-plot<\/tt> and <tt class=\"pyret\">draw-plot<\/tt>:\r\n&nbsp;<textarea class=\"pyret\">\r\n# function-plot :: (Number -&gt; Number) -&gt; Series\r\n# draw-plot :: String, Series -&gt; Plot\r\n<\/textarea>\r\n<tt class=\"pyret\">function-plot<\/tt> consumes any function that maps from Numbers to Numbers (xs to ys, for example), and returns a series representing the graph of that function. <tt class=\"pyret\">draw-plot<\/tt> consumes a title and that series, and produces an Image. Make sure you write these down in your contracts page!<\/p><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>We can define identifiers for both the series and the plot:\r\n&nbsp;<textarea class=\"pyret\">\r\n# define the series and the graph for the function f(x)=&#8730;x\r\nsqrt-plot  = function-plot(num-sqrt)\r\nsqrt-graph = draw-plot(\"f(x)=&#8730;x\", sqrt-plot)\r\n<\/textarea>\r\nReview: once I&rsquo;ve defined an identifier, I can see its value for by clicking Run, then typing in the identifier in the Interactions Area and hitting Enter.<\/p><p>Looking at your contracts page, do you see any other functions that we could plot?<\/p><\/div><div class=\"teacher\"><\/div><\/li><\/ul><\/div><\/div><\/blockquote><blockquote class=\"LessonBoundary\"><div class=\"BootstrapPageTitle\">Closing<\/div><div class=\"content\"><div class=\"overview\"><span class=\"BootstrapLogo\"><p><img src=\"logo.png\" alt=\"bootstrap logo\" width=\"150\" height=\"150\"\/><\/p><\/span><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><p>Overview<\/p><\/span><\/span><div class=\"LessonLearningObjectives\"><p><span style=\"font-weight: bold\">Learning Objectives<\/span><\/p><ul><\/ul><\/div><div class=\"LessonEvidenceStatementes\"><p><span style=\"font-weight: bold\">Evidence Statementes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonProductOutcomes\"><p><span style=\"font-weight: bold\">Product Outcomes<\/span><\/p><ul><\/ul><\/div><div class=\"LessonMaterials\"><p><span style=\"font-weight: bold\">Materials<\/span><\/p><ul><\/ul><\/div><div class=\"LessonPreparation\"><p><span style=\"font-weight: bold\">Preparation<\/span><\/p><ul><\/ul><\/div><\/div><div class=\"segment\"><p><a name=\"lesson_Closing8774\"><\/a><span><\/span><\/p><span class=\"BootstrapLessonTitle\"><span class=\"BSLessonName\"><span class=\"Slide-Lesson-Title\">Closing<\/span>\r\n\r\n\r\n\r\n<span class=\"time\">(Time 5 minutes)<\/span>\r\n\r\n<\/span><p><\/p><\/span><ul class=\"lesson\"><li class=\"lessonItem\"><div class=\"student\"><p><span class=\"slideText\"><span class=\"BootstrapSlideTitle\">Closing<\/span><\/span>One of the skills you&rsquo;ll learn in this class is how to diagnose and fix errors. Some of these errors will be <span style=\"font-style: italic\">syntax errors<\/span>: a missing comma, an unclosed string, etc. All the other errors are <span style=\"font-style: italic\">contract errors<\/span>. If you see an error and you know the syntax is right, ask yourself these two questions:<\/p><ul><li><p>What is the function that is generating that error?<\/p><\/li><li><p>What is the contract for that function?<\/p><\/li><\/ul><\/div><div class=\"teacher\"><\/div><\/li><li class=\"lessonItem\"><div class=\"student\"><p>By learning to use values, variables, operations and functions, you are now familiar with the fundamental concepts needed to write simple programs.  You will have many opportunities to use these concepts in the next units, by writing programs to answer data science questions.<\/p><div class=\"activity not-in-tutorial\"><p>Make sure to save your Pyret program as <\/p><p><tt class=\"pyret\">Pyret Practice<\/tt><\/p><p> into your Google Drive, so you can go back to it later.<\/p><\/div><\/div><div class=\"teacher\"><\/div><\/li><\/ul><\/div><\/div><\/blockquote><p><\/p><div id=\"copyright\"><a href=\"http:\/\/creativecommons.org\/licenses\/by-nc-nd\/4.0\/\" target=\"_blank\"><img src=\"pict_3.png\" alt=\"image\" width=\"88\" height=\"31\"\/><\/a>Bootstrap:Data Science by Shriram Krishnamurthi, Joe Politz and Ben Lerner is licensed under a <a href=\"http:\/\/creativecommons.org\/licenses\/by-nc-nd\/4.0\/\" target=\"_blank\">Creative Commons 4.0 Unported License<\/a>. Based on a work at <a href=\"http:\/\/www.bootstrapworld.org\/\">www.BootstrapWorld.org<\/a>. Permissions beyond the scope of this license may be available by contacting <a href=\"mailto:schanzer@BootstrapWorld.org\">schanzer@BootstrapWorld.org<\/a>.<\/div><\/div><\/div><div id=\"contextindicator\">&nbsp;<\/div><\/body><\/html>");
    stepWindow.append(first);

    // NOTE: if want to do more settings, create a new class and edit stuff in tutorial.css
    // $("li.lessonItem").find(".student").addClass("studentNotes");

/* NOTE: background color and disappear
    // set student notes' background color
    // .student means find the element with a class "student"
    $("li.lessonItem").find(".student").css("background-color", "#85aff2");

    // make teacher notes disappear
    $("li.lessonItem").find(".teacher").css("font-size", "0");
*/

   // an array to store all student class
   var studentArray = $("li.lessonItem").find(".student");
   var metaArray = [];
   var choppedArray = [];
   var newSection = [];

   // first build an array with all <p>, <activity> and <ul> in the order they come in.
   $(studentArray).each(function(){
     metaArray.push($(this).children());
   });

   //then build another array that each bucket is a group of things based on <activity>
   var current;

   for (var i = 0; i < metaArray.length; i++) {
     for (var j = 0; j < metaArray[i].length; j++) {
       current = $(metaArray[i][j]);
       newSection.push(current);
       //if (current[0].tagName === "DIV") {
       if (current.hasClass("activity") || (current.find(".activity").length > 0)) {
         choppedArray.push(newSection);
         newSection = [];
       }
     }
   }

   // NOTE: clear things in instruction before displaying the tutorial
   $("#instruction").empty();

   var correctAnswer = [];
   correctAnswer.length = choppedArray.length; //initialize answer array's length to be the same as number of activity

   var activityType = [];
   activityType.length = choppedArray.length;

   var attempts = 0;
   var pageNum = 0;
   var checked = false;

   // loop through to build correctAnswer and activityType
   for (var i = 0; i < choppedArray.length; i++) {
     var last = $(choppedArray[i][(choppedArray[i].length) -1]);

     if (last.hasClass("single-answer") || last.find(".single-answer").length != 0) {
       activityType[i] = "single-answer";
       var correct = last.find(".activityanswer");
       var actualAnswer = $(correct).find("p").text();
       correctAnswer[i] = actualAnswer;
     }

     if (last.hasClass("predicate") || last.find(".predicate").length != 0) {
       activityType[i] = "predicate";
       var correct = last.find(".activityanswer");
       var actualAnswer = $(correct).find("p").text();
       correctAnswer[i] = actualAnswer;
     }

     if (last.hasClass("not-in-tutorial") || last.find(".not-in-tutorial").length != 0) {
       activityType[i] = "not-in-tutorial";
     }

     if (last.hasClass("not-in-repl") || last.find(".not-in-repl").length != 0) {
       activityType[i] = "not-in-repl";
     }

     if (last.hasClass("multi-parts") || last.find(".multi-parts").length != 0) {
       activityType[i] = "multi-parts";
       var correct = last.find(".activityanswer");
       var actualAnswer = $(correct).find("p").text();
       correctAnswer[i] = actualAnswer;
     }
   }

   // start with page 0
   showPage(0);

   function showPage(i) {
     if (pageNum == activityType.length) {
       var done = $("<span>").addClass("done");
       done.text("Congratulations! You've completed the tutorial!");
       stepWindow.append(done);
     }
     if (activityType[i] === "not-in-tutorial") {
       // don't display if not-in-tutorial
       pageNum += 1;
       showPage(pageNum);
       return;
     }

     stepWindow.append(choppedArray[i]);
     $(".activityanswer").hide();
     $("span.BootstrapSlideTitle").hide();
     $(document).find(".activity").css("background-color", "rgb(159, 180, 204)");

     // if not-in-repl or multi-parts, then auto next button
     if (activityType[i] === "not-in-repl" || activityType[i] === "multi-parts") {
       checked = true;
       displayNext();
     }
   }

/* NOTE: add next button without check
   function showPage(i) {
     stepWindow.append("<br/> <br/>" + "<b>" + "This is page" + i + "</b>" + "<br/>");
     stepWindow.append(choppedArray[i]);
     var nextElt = $("<button>").addClass("next");
     nextElt.text("Next");
     stepWindow.append(nextElt);
     nextElt.click(function() {
       if (i < (choppedArray.length - 1)) {
         showPage(i+1);
       }
     });
   }
*/

   var tryAgain = $("<span>").addClass("again");
   tryAgain.text("Please try again");
   stepWindow.append(tryAgain);
   $(".again").hide();

   function displayNext() {
     console.log("pageNum: " + pageNum);
     var nextElt = $("<button>").addClass("next");
     nextElt.text("Next");
     $(".again").hide();
     stepWindow.append(nextElt);
     nextElt.click(function() {
       pageNum += 1;
       showPage(pageNum);
       var currPos = $("#instruction").scrollTop();
       $("#instruction").scrollTop(currPos + 70);
       checked = false;
     });
     $("#instruction").scrollTop($("#instruction")[0].scrollHeight);
     attempts = 0;
     checked = true;
   }

   function displayTry(answer, correct) {
     //NOTE: for debug purpose only
     console.log("result in REPL is: " + answer);
     console.log("should be: " + correct);
     console.log("pageNum: " + pageNum);

     if (attempts == 0) {
       stepWindow.append(tryAgain);
     }
     $(".again").hide(800);
     $(".again").show(800);
     $("#instruction").scrollTop($("#instruction")[0].scrollHeight);
     attempts +=1;
   }

   function checkAnswer(answer, correct, type){
     if (type === "single-answer") {
       if (answer == correct) {
         displayNext();
       } else {
         displayTry(answer, correct);
       }
     }

     if (type === "predicate") {
       var checkFun = eval(correct);
       if (checkFun(answer)) {
         displayNext();
       } else {
         displayTry(answer, correct);
       }
     }
   }

// NOTE: initial attempt to hook up cpo with tutorial
   function afterRun(answer){
     console.log("in afterRun");
     var returnAnswer = $("<span>");
     returnAnswer.text(answer);
     $("#instruction").append(returnAnswer);
     console.log(answer);
   }

   // NOTE: from stackoverflow: https://stackoverflow.com/questions/10415400/jquery-detecting-div-of-certain-class-has-been-added-to-dom
   function onElementInserted(containerSelector, elementSelector, callback) {
      var onMutationsObserved = function(mutations) {
          mutations.forEach(function(mutation) {
              if (mutation.addedNodes.length) {
                  var elements = $(mutation.addedNodes).find(elementSelector);
                  for (var i = 0, len = elements.length; i < len; i++) {
                      callback(elements[i]);
                  }
              }
          });
      };

      var target = $(containerSelector)[0];
      var config = { childList: true, subtree: true };
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
      var observer = new MutationObserver(onMutationsObserved);
      observer.observe(target, config);
    }

    // find successful result
    onElementInserted('body', '.replTextOutput', function(element) {
      console.log("repl success");
      var answer = $(element).text();
      console.log("checked: " + checked);
      console.log("pageNum: " + pageNum);
      if (!checked) {
        var type = activityType[pageNum];
        console.log("activityType: " + type);
        checkAnswer(answer, correctAnswer[pageNum], type);
      }
    });

    // find failed result
    onElementInserted('body', '.cm-snippet', function(element) {
      console.log("repl fail");
      if (!checked) {
        displayTry("compile error", correctAnswer[pageNum]);
      }
    });

   return runtime.makeJSModuleReturn(
     {foo: 5,
      checkAnswer: checkAnswer,
      afterRun: afterRun});
  }
})
