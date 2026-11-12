// Detecting Reasoning Error, in the two formats the test uses most:
//  1. "Whose reasoning is correct?" (X only / Y only / Both / Neither). Options stay in this fixed order.
//  2. "Which sentence shows the mistake?" for a flawed conclusion or experiment.
// Original questions written for this app. Each "whose reasoning" answer is justified claim by claim in exp.
const who = (x, y) => [`${x} only`, `${y} only`, `Both ${x} and ${y}`, `Neither ${x} nor ${y}`];
const T = 'Detecting Reasoning Error';

export default [
  { id: 't131', topic: T, diff: 2, fixedOrder: true,
    q: `<div class="box">The school library only lends books to students who have returned all of the books they borrowed before. Every student who borrows a book must also show their library card.</div>
      <b>Mei:</b> "Josh borrowed a book today, so he must have returned all his earlier books."<br><b>Arun:</b> "Priya showed her library card today, so she must have borrowed a book."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Mei', 'Arun'), a: 0,
    exp: `<b>Mei ✔</b> The library <i>only</i> lends to students who have returned everything, so anyone who borrowed must have returned their books.<br><b>Arun ✘</b> Borrowers must show a card, but showing a card doesn't mean you borrowed. Priya might have shown it for another reason, or been refused because she still had a book out.<br><b>Watch for:</b> "must do X to get Y" does not mean "did X, so got Y".` },
  { id: 't132', topic: T, diff: 2, fixedOrder: true,
    q: `<div class="box">In a quiz, each team answers 10 questions in Round 1 and 10 questions in Round 2. A team's total score is its Round 1 score plus its Round 2 score. The Owls and the Hawks finished with the same total score.</div>
      <b>Lena:</b> "If the Owls scored more than the Hawks in Round 1, then the Hawks must have scored more than the Owls in Round 2."<br><b>Omar:</b> "If both teams scored 7 in Round 2, then they must have scored the same as each other in Round 1."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Lena', 'Omar'), a: 2,
    exp: `Same total means whatever one team gains in one round, it must lose in the other.<br><b>Lena ✔</b> If the Owls were ahead after Round 1, the Hawks must have caught up exactly in Round 2, so they scored more in Round 2.<br><b>Omar ✔</b> Equal totals minus equal Round 2 scores leaves equal Round 1 scores.<br><b>Strategy:</b> test with numbers. Totals 15: Owls 8 + 7, Hawks 6 + 9 fits Lena; Owls 8 + 7, Hawks 8 + 7 fits Omar.` },
  { id: 't133', topic: T, diff: 2, fixedOrder: true,
    q: `<div class="box">Every student in the chess club is also in the maths club. Some students in the maths club are also in the choir.</div>
      <b>Ruby:</b> "Zane is in the chess club, so he must be in the maths club."<br><b>Dev:</b> "Kira is in the choir, so she must be in the maths club."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Ruby', 'Dev'), a: 0,
    exp: `<b>Ruby ✔</b> <i>Every</i> chess club member is in the maths club, so Zane is.<br><b>Dev ✘</b> We only know that <i>some</i> maths club students sing in the choir. That doesn't mean every choir member is in the maths club. Kira might sing in the choir and not do maths club at all.<br><b>Draw it:</b> a chess circle inside a maths circle; the choir circle only overlaps the maths circle.` },
  { id: 't134', topic: T, diff: 3, fixedOrder: true,
    q: `<div class="box">On every day that it rains, the corner bakery sells all of its croissants.</div>
      <b>Hugo:</b> "The bakery sold all its croissants today, so it must have rained."<br><b>Tess:</b> "It didn't rain today, so the bakery definitely didn't sell all its croissants."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Hugo', 'Tess'), a: 3,
    exp: `The box only tells us: rain → sold out.<br><b>Hugo ✘</b> He turns it around (sold out → rain). The croissants might sell out on a sunny day too, for example on a busy weekend.<br><b>Tess ✘</b> She assumes no rain → not sold out. The box says nothing about dry days.<br>Both make the same kind of mistake: treating "if A then B" as if it also meant "if B then A".` },
  { id: 't135', topic: T, diff: 2, fixedOrder: true,
    q: `<div class="box">To be entered in the art competition, a painting must be less than 1 metre wide and must be finished by Friday. Only paintings that are entered are judged, and judging happens on Saturday.</div>
      <b>Noah:</b> "My painting is 80 cm wide and I finished it on Thursday, so it will definitely be judged."<br><b>Ivy:</b> "My painting was judged on Saturday, so it must be less than 1 metre wide."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Noah', 'Ivy'), a: 1,
    exp: `<b>Noah ✘</b> His painting meets the rules, but the box doesn't say every painting that meets the rules is entered. He may not have entered it, so it might not be judged.<br><b>Ivy ✔</b> Only entered paintings are judged, and every entered painting is less than 1 metre wide. Judged → entered → less than 1 metre.<br><b>Key idea:</b> meeting the requirements is necessary, but not enough on its own.` },
  { id: 't136', topic: T, diff: 2, fixedOrder: true,
    q: `<div class="box">Ali can only get to school on Bus 1 or Bus 2. Bus 1 leaves the park at 8:00 am and takes 30 minutes. Bus 2 leaves the park at 8:10 am and takes 25 minutes.</div>
      <b>Sami:</b> "If Ali catches Bus 2, he will get to school later than if he catches Bus 1."<br><b>Gia:</b> "If Ali wants to arrive before 8:32 am, he must catch Bus 1."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Sami', 'Gia'), a: 2,
    exp: `Work out arrival times: Bus 1 arrives 8:00 + 30 min = <b>8:30</b>. Bus 2 arrives 8:10 + 25 min = <b>8:35</b>.<br><b>Sami ✔</b> 8:35 is later than 8:30.<br><b>Gia ✔</b> Only Bus 1 arrives before 8:32, and Ali has no other way to get there.<br><b>Trap:</b> Bus 2 is the faster trip, but it leaves later.` },
  { id: 't137', topic: T, diff: 2, fixedOrder: true,
    q: `<div class="box">All of the cupcakes are on two trays. Every cupcake on the top tray has chocolate icing. Some cupcakes on the bottom tray have chocolate icing.</div>
      <b>Kai:</b> "This cupcake has chocolate icing, so it must have come from the top tray."<br><b>Lia:</b> "This cupcake has vanilla icing, so it must have come from the bottom tray."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Kai', 'Lia'), a: 1,
    exp: `<b>Kai ✘</b> Some bottom-tray cupcakes are chocolate too, so a chocolate cupcake could be from either tray.<br><b>Lia ✔</b> Every top-tray cupcake is chocolate, so a vanilla one can't be from the top tray. There are only two trays, so it must be from the bottom.` },
  { id: 't138', topic: T, diff: 3, fixedOrder: true,
    q: `<div class="box">A spelling test has two parts, Part A and Part B. Each part is marked out of 20, and the two marks are added. Maya's total was 34. Ethan's total was also 34, but his Part A mark was 6 lower than Maya's.</div>
      <b>Pia:</b> "Maya must have scored at least 14 in Part A."<br><b>Leo:</b> "Ethan must have scored full marks in Part B."<br><br>If the information in the box is true, whose reasoning is correct?`,
    opts: who('Pia', 'Leo'), a: 2,
    exp: `<b>Pia ✔</b> Part B is at most 20, so Maya's Part A is at least 34 − 20 = 14.<br><b>Leo ✔</b> Ethan's Part A is 6 lower, so his Part A is at most 20 − 6 = 14. With a total of 34, his Part B must be at least 34 − 14 = 20. The most possible is 20, so it is exactly 20.<br>(So Maya scored 20 + 14 and Ethan 14 + 20.)<br><b>Strategy:</b> use the maximum of 20 to pin down the other part.` },
  { id: 't139', topic: T, diff: 2,
    q: `Mr Fox wanted to know whether listening to music helps students solve puzzles faster. Students who chose to sit by the window listened to music while solving a puzzle; the rest of the class solved it in silence. The music group finished faster on average.<br><b>Mr Fox:</b> "So listening to music makes students solve puzzles faster."<br><br>Which sentence shows the mistake Mr Fox has made?`,
    opts: ['The students who chose the window seats might already have been faster at puzzles.', 'Some students might not enjoy music.', 'Some students might listen to music at home as well.', 'Puzzles are only one kind of school activity.'], a: 0,
    exp: `For a fair test, the two groups must be alike in every way except the music. Here the students <b>chose</b> their group, so the music group may simply have been better at puzzles to begin with. The difference might have nothing to do with music.<br>The other sentences don't affect what happened in this experiment.` },
  { id: 't140', topic: T, diff: 1,
    q: `Hill School has 600 students. To find the school's favourite sport, Jade asked the 20 students at basketball training. 15 of them said basketball.<br><b>Jade:</b> "Basketball is the favourite sport at Hill School."<br><br>Which sentence shows the mistake Jade has made?`,
    opts: ['Students at basketball training are more likely to choose basketball than other students.', 'Some students might like two sports equally.', 'Hill School might not have a basketball court.', '15 out of 20 is less than all of them.'], a: 0,
    exp: `Jade only asked students who already chose to play basketball, so her group doesn't represent the whole school. A fairer survey would ask students picked from every class.<br>This mistake is called a <b>biased sample</b>.` },
  { id: 't141', topic: T, diff: 2,
    q: `Eva grew two identical seedlings. Plant A got fertiliser and was kept on a sunny windowsill. Plant B got no fertiliser and was kept in a dark cupboard. After three weeks, Plant A was much taller.<br><b>Eva:</b> "Fertiliser makes plants grow taller."<br><br>Which sentence shows the mistake Eva has made?`,
    opts: ['The plants also got different amounts of light, so the light could explain the difference.', 'Plant B might have grown taller if she had waited longer.', 'Eva did not say what kind of fertiliser she used.', 'Some plants grow well without fertiliser.'], a: 0,
    exp: `Two things changed at once: fertiliser <b>and</b> light. Plants need light to grow, so Plant A might have grown taller because of the sunshine, not the fertiliser.<br>A fair test changes only <b>one</b> thing and keeps everything else the same.` },
  { id: 't142', topic: T, diff: 2,
    q: `At Green Street School, every Year 5 student must wear a hat during sport. At sport today, Theo was wearing a hat.<br><b>Theo's friend:</b> "So Theo must be in Year 5."<br><br>Which sentence shows the mistake Theo's friend has made?`,
    opts: ['Students in other years might also wear hats during sport.', 'Theo might have forgotten his hat on another day.', 'The rule might change next year.', 'Not every Year 5 student plays the same sport.'], a: 0,
    exp: `The rule says Year 5 → hat. It doesn't say hat → Year 5. Students from other years could also wear hats, because the rule doesn't stop them.<br>This is the same mistake as "all dogs have tails; my cat has a tail; so my cat is a dog".` },

  // ---- Strengthening and Weakening (the "matching arguments" chapter style) ----
  { id: 't143', topic: 'Strengthening and Weakening', diff: 1,
    q: `<b>Mia:</b> "Our school should start a vegetable garden. Students who help grow vegetables are more likely to eat them."<br><br>Which statement, if true, most <b>strengthens</b> Mia's argument?`,
    opts: ['A study found children who helped grow vegetables chose to eat them twice as often as other children.', 'Vegetable gardens need to be watered during the school holidays.', 'Some students in the school already eat plenty of vegetables.', 'The school canteen sells fruit at lunchtime.'], a: 0,
    exp: `Mia's reason is that growing vegetables makes students more likely to eat them. The study gives direct evidence for exactly that link, so it strengthens her argument.<br>Watering in the holidays is a practical problem (it weakens, if anything). Students who already eat vegetables and the canteen's fruit don't touch her reason.` },
  { id: 't144', topic: 'Strengthening and Weakening', diff: 2,
    q: `<b>Coach:</b> "We lost on Sunday because we didn't train on Saturday."<br><br>Which statement, if true, most <b>weakens</b> the coach's argument?`,
    opts: ['The team we played has beaten every team in the league by more than 20 points, including teams that trained every day.', 'Training on Saturday is usually the most fun session of the week.', 'Our team also trains on Tuesdays and Thursdays.', 'Players who missed training said they felt tired on Sunday.'], a: 0,
    exp: `The coach blames missing Saturday training. If the other team crushes even teams that train every day, the loss is better explained by how strong the opponent was, so the coach's reason looks weak.<br>Feeling tired actually <b>supports</b> the coach. Fun sessions and the other training days don't change the argument.` },
  { id: 't145', topic: 'Strengthening and Weakening', diff: 1,
    q: `<b>Parent:</b> "The library should stay open later, because many students can't come until their parents finish work at 5:30 pm."<br><br>Which statement, if true, most <b>strengthens</b> the parent's argument?`,
    opts: ['A survey found that most families would use the library between 5:30 pm and 7 pm.', 'The library has just bought new computers.', 'Some students prefer to read at home.', 'The librarian lives close to the library.'], a: 0,
    exp: `The argument is that later hours would let more students come. A survey showing families would actually visit after 5:30 pm supports that directly.<br>New computers and where the librarian lives are off the point. Students who prefer reading at home slightly <b>weaken</b> the argument.` },
  { id: 't146', topic: 'Strengthening and Weakening', diff: 2,
    q: `<b>Sam:</b> "Our class should have no homework, because homework doesn't help students learn."<br><br>Which statement, if true, most <b>weakens</b> Sam's argument?`,
    opts: ['In our class, students who did their homework improved their test results more than students who did not.', 'Some students find homework boring.', 'Homework is usually set on Tuesdays.', 'Many students play sport after school.'], a: 0,
    exp: `Sam's reason is that homework doesn't help learning. Evidence that students who did homework improved more goes straight against that reason.<br>Finding it boring or being busy with sport might be reasons to dislike homework, but they don't show whether it helps. The day it is set doesn't matter.` },
  { id: 't147', topic: 'Strengthening and Weakening', diff: 3,
    q: `<b>Priya:</b> "The new bike lane has made our street safer. There have been far fewer bike accidents since it opened."<br><br>Which statement, if true, most <b>strengthens</b> Priya's argument?`,
    opts: ['The number of people riding bikes on the street has stayed the same since the lane opened.', 'The bike lane is painted bright green.', 'The lane opened in winter, when fewer people ride bikes.', 'Cars can still drive along the street.'], a: 0,
    exp: `Fewer accidents could just mean fewer people riding. If the number of riders stayed the same, that other explanation is ruled out, so the lane really does seem to have made riding safer.<br>The winter opening suggests the fall might be because fewer people ride, which <b>weakens</b> her argument. The paint colour and cars are beside the point.` },
  { id: 't148', topic: 'Strengthening and Weakening', diff: 2,
    q: `<b>Leo:</b> "Eating fish makes you smarter. The three top students in our class all eat fish every week."<br><br>Which statement, if true, most <b>weakens</b> Leo's argument?`,
    opts: ['Many students who eat fish every week got lower marks than students who never eat fish.', 'Fish contains vitamins that the brain needs.', 'Fish costs more than chicken at our local shop.', 'Leo does not like the taste of fish.'], a: 0,
    exp: `Leo uses only three students. If lots of other fish-eaters score lower than students who never eat fish, eating fish clearly doesn't go with being smarter.<br>Vitamins for the brain would <b>support</b> Leo. The price of fish and Leo's taste have nothing to do with his reasoning.` },
];
