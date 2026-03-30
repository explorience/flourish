import { Header } from '@/components/header';

export const metadata = {
  title: 'Moderator Guide — Flourish',
  description: 'Everything you need to know about moderating Flourish, a community exchange board.',
};

export default function ModeratorGuidePage() {
  return (
    <main className="page-bg min-h-screen">
      <Header />

      <div className="max-w-2xl mx-auto px-5 py-14">

        <h1 className="display-heading text-2xl font-bold uppercase tracking-wide mb-2">
          Moderator Guide
        </h1>
        <p className="prose-dark-italic text-sm mb-12">
          Everything you need to know about keeping Flourish a safe, useful space for our community.
        </p>

        <Section title="What is Flourish?">
          <P>
            Flourish is a free community exchange board. Think of it as a
            neighbourhood bulletin board — but online, and available to anyone in the city.
          </P>
          <P>
            The idea is simple: people post what they <strong>need</strong> or what they can <strong>offer</strong>,
            and neighbours connect with each other. No money changes hands (though it can if people agree to it).
            It&apos;s about sharing resources, skills, time, and space within our community.
          </P>
          <P>Examples of what people post:</P>
          <ul className="list-dark ml-5 space-y-1.5 mb-4">
            <li><strong className="text-need-accent">Needs:</strong> &ldquo;Ride to appointment Tuesday&rdquo;, &ldquo;Looking for a winter coat, size M&rdquo;, &ldquo;Need help moving a couch&rdquo;</li>
            <li><strong className="text-offer-accent">Offers:</strong> &ldquo;Free kids clothes, ages 4-6&rdquo;, &ldquo;Can help with basic plumbing&rdquo;, &ldquo;Spare room for short-term stay&rdquo;</li>
          </ul>
          <P>
            Posts are organised into four categories: <strong>Items</strong>, <strong>Services</strong>,
            {' '}<strong>Skills</strong>, and <strong>Space</strong>. Each post also has an urgency level
            (urgent, this week, or flexible) so people can prioritise what needs attention now.
          </P>
        </Section>

        <Section title="How it works for users">
          <Step n={1} label="Browse the board">
            Anyone can visit <a href="/" className="link-offer">the site</a> and
            browse all active posts without an account. They can filter by needs vs offers, by category, or search for something specific.
            There&apos;s also a map view showing approximate locations of posts.
          </Step>
          <Step n={2} label="Post something">
            To create a post, you need to sign in with a magic link (a one-time code sent to your email — no password needed).
            The posting form walks you through three steps: what type of post (need or offer), the details, and your first name.
            All connections happen through the app — no personal phone numbers or emails are displayed publicly.
          </Step>
          <Step n={3} label="Connect with someone">
            When you see a post you want to respond to, click &ldquo;I can help&rdquo; (for needs) or &ldquo;I&apos;m interested&rdquo; (for offers).
            You enter your name and an optional message. The poster gets notified by email that someone responded,
            and both people can then message each other through the app.
          </Step>
          <Step n={4} label="SMS posting">
            People can also text the Flourish phone number to create posts without using the website at all.
            This makes the board accessible to people who are more comfortable with texting or don&apos;t have reliable internet access.
            SMS posts appear on the board like any other post.
          </Step>
        </Section>

        <Divider />

        <Section title="Your role as a moderator">
          <P>
            As a moderator, you help keep Flourish safe, relevant, and welcoming. You&apos;re not a gatekeeper —
            the default assumption is that posts are fine. You&apos;re here to catch the occasional problem,
            not to approve every post before it goes live.
          </P>
          <P>
            Posts appear on the board immediately when someone creates them. Your job is to review them
            and remove anything that shouldn&apos;t be there. Think of it as post-moderation: posts are
            visible first, and you can take action if needed.
          </P>
          <P><strong>What moderators can do:</strong></P>
          <ul className="list-dark ml-5 space-y-1.5 mb-4">
            <li>Review posts on the board and in the admin dashboard</li>
            <li>Approve posts (confirm they&apos;re fine — optional, since posts are approved by default)</li>
            <li>Reject posts (remove them from the public board)</li>
            <li>View basic stats about the board&apos;s activity</li>
          </ul>
          <P><strong>What moderators cannot do:</strong></P>
          <ul className="list-dark ml-5 space-y-1.5 mb-4">
            <li>Edit other people&apos;s posts (only approve or reject)</li>
            <li>Add or remove other moderators (only admins can do this)</li>
            <li>See users&apos; private messages or personal contact details</li>
          </ul>
        </Section>

        <Section title="Getting started">
          <Step n={1} label="Log in">
            Go to <a href="/auth" className="link-offer">Sign In</a> and
            enter the email address that was registered for your moderator account. You&apos;ll receive a magic link —
            click it to sign in. No password needed.
          </Step>
          <Step n={2} label="Access the admin dashboard">
            Once signed in, go to <a href="/admin" className="link-offer">Admin Dashboard</a>.
            If your email is in the moderator list, you&apos;ll see the dashboard with stats, a list of posts to review,
            and moderation tools. If you see an &ldquo;access denied&rdquo; message, your email may not have been added yet — contact the admin.
          </Step>
          <Step n={3} label="Review posts">
            You can moderate posts in two places:
            <ul className="ml-5 mt-2 space-y-1 list-disc">
              <li><strong>On the board itself</strong> — when you&apos;re logged in as a moderator, you&apos;ll see small approve/reject buttons on each post card</li>
              <li><strong>In the admin dashboard</strong> — the moderation section lists all active posts with action buttons</li>
            </ul>
          </Step>
        </Section>

        <Section title="Moderation decisions">
          <P>
            Use your best judgement. The goal is to keep the board useful and safe, not to be overly strict.
            Here&apos;s a general framework:
          </P>

          <SubHead text="Approve (leave it up) if the post:" />
          <ul className="list-dark ml-5 space-y-1 mb-5">
            <li>Is a genuine need or offer relevant to your community</li>
            <li>Is written in good faith, even if a bit vague</li>
            <li>Falls into one of the categories (items, services, skills, space)</li>
            <li>Is something a neighbour might reasonably post on a community board</li>
          </ul>

          <SubHead text="Reject (remove it) if the post:" />
          <ul className="list-dark ml-5 space-y-1 mb-5">
            <li>Is spam, advertising, or a commercial solicitation</li>
            <li>Contains hate speech, threats, harassment, or discrimination</li>
            <li>Shares someone else&apos;s private information</li>
            <li>Is clearly not relevant to your community</li>
            <li>Promotes illegal activity</li>
            <li>Is a duplicate or test post</li>
            <li>Contains explicit or inappropriate content</li>
          </ul>

          <SubHead text="Use your judgement for:" />
          <ul className="list-dark ml-5 space-y-1 mb-5">
            <li>Posts that are vague but seem genuine — leave them up, people can ask for details</li>
            <li>Posts offering paid services — fine as long as they&apos;re not pushy commercial ads</li>
            <li>Posts from outside your area — if it&apos;s nearby and relevant, it&apos;s probably fine</li>
            <li>Unusual requests — if it doesn&apos;t violate any of the rejection criteria, let the community decide</li>
          </ul>

          <P>
            When in doubt, leave the post up. Flourish works best when the barrier to participation is low.
            If you&apos;re genuinely unsure, reach out to the admin before rejecting.
          </P>
        </Section>

        <Section title="Rejecting a post">
          <P>
            When you reject a post, it&apos;s removed from the public board but not deleted from the database.
            The poster isn&apos;t currently notified when their post is rejected (this may change in future).
          </P>
          <P>
            You can optionally provide a reason when rejecting. Even if the poster doesn&apos;t see it now,
            it helps other moderators understand why the decision was made.
          </P>
        </Section>

        <Divider />

        <Section title="Moderator code of conduct">
          <ul className="list-dark ml-5 space-y-2.5 mb-4">
            <li><strong>Be fair and consistent.</strong> Apply the same standards to all posts regardless of who posted them.</li>
            <li><strong>Assume good faith.</strong> Most people are genuinely trying to participate. Give the benefit of the doubt.</li>
            <li><strong>Protect privacy.</strong> Don&apos;t share any user information you see through the admin tools. Don&apos;t screenshot or discuss specific users outside the mod team.</li>
            <li><strong>Don&apos;t use moderation tools for personal reasons.</strong> Never reject a post because you personally disagree with it (unless it violates the guidelines above).</li>
            <li><strong>Ask if unsure.</strong> It&apos;s better to check with the admin than to make a wrong call. No one expects you to have all the answers.</li>
            <li><strong>Be kind.</strong> If you ever interact with a user about moderation (e.g. if we add messaging to posters), be respectful and explain clearly.</li>
          </ul>
        </Section>

        <Divider />

        <Section title="Things to test">
          <P>
            Before you start moderating, walk through these steps to make sure everything works for you.
            This should only take a few minutes.
          </P>

          <SubHead text="As a regular user" />
          <ul className="list-dark ml-5 space-y-1.5 mb-5">
            <li>Browse the board without logging in — can you see posts, filter by need/offer, search?</li>
            <li>Open the map view — do location pins show up?</li>
            <li>Log in with your email — did the magic link arrive? (Check spam if not)</li>
            <li>Create a test post (mark it as an offer, something like &ldquo;Test post — please ignore&rdquo;) — does it appear on the board?</li>
            <li>Respond to your own test post or another test post — does the poster get notified?</li>
            <li>Try texting the SMS number (the SMS number (if configured)) with &ldquo;hello&rdquo; — does the AI assistant respond?</li>
            <li>Delete or mark your test post as fulfilled when done</li>
          </ul>

          <SubHead text="As a moderator" />
          <ul className="list-dark ml-5 space-y-1.5 mb-5">
            <li>Go to <a href="/admin" className="link-offer">Admin Dashboard</a> — can you access the dashboard?</li>
            <li>Find a test post in the moderation list — can you see the approve/reject buttons?</li>
            <li>Approve a test post — does the status update?</li>
            <li>Reject a test post — does it disappear from the public board?</li>
            <li>Check the stats section — does it show recent activity?</li>
          </ul>

          <SubHead text="If something doesn't work" />
          <P>
            Don&apos;t worry — just note what happened and let the admin know through the{' '}
            <a href="/feedback" className="link-offer">feedback form</a>.
            Include what you tried, what you expected, and what actually happened.
          </P>
        </Section>

        <Section title="Questions?">
          <P>
            If you have questions about moderation, need help with the tools, or want to flag something,
            use the <a href="/feedback" className="link-offer">feedback form</a> or
            contact the admin directly.
          </P>
          <P>
            Thank you for volunteering your time to help keep Flourish a good space. It genuinely matters.
          </P>
        </Section>

      </div>
    </main>
  );
}

/* ── Reusable components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="section-title text-sm font-bold uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubHead({ text }: { text: string }) {
  return (
    <p className="section-subhead text-xs font-bold uppercase tracking-wider mb-2 mt-4">
      {text}
    </p>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="prose-dark mb-4">{children}</p>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex gap-4">
      <div className="step-number flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-bold">
        {n}
      </div>
      <div className="flex-1">
        <p className="step-label text-sm font-bold mb-1">{label}</p>
        <div className="step-body">{children}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="section-divider my-10" />;
}
