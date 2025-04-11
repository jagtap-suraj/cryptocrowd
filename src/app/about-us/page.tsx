import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, FileText, Shield, Users } from "lucide-react";

export default function AboutUsPage() {
  return (
    <>
      <div className="relative bg-gradient-to-b from-primary/20 to-background py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="container relative z-10 mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">About CryptoCrowd</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering creators and innovators through blockchain-based crowdfunding
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 max-w-5xl">
        <section className="mb-12">
          <div className="flex items-start gap-4">
            <BookOpen className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="mb-4">
                CryptoCrowd is a decentralized crowdfunding platform built on blockchain technology that 
                connects creators with backers worldwide. We aim to democratize fundraising by leveraging 
                the power of cryptocurrency and smart contracts to create a transparent, secure, and 
                efficient ecosystem for all participants.
              </p>
              <p>
                Our platform enables innovation by providing creators with the tools they need to fund 
                their projects, while giving backers the confidence that their contributions are secure 
                and properly managed through immutable smart contracts.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4">
            <FileText className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Terms & Conditions</h2>
              <p className="mb-6">
                Please read these terms carefully before using CryptoCrowd. By accessing or using our 
                platform, you agree to be bound by these terms and conditions.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="general-terms">
                  <AccordionTrigger>General Terms</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>CryptoCrowd is a platform that facilitates blockchain-based crowdfunding between campaign creators and backers.</li>
                      <li>All transactions on the platform are executed through smart contracts on the blockchain.</li>
                      <li>The platform operates on an &quot;all-or-nothing&quot; model where campaign creators only receive funds if they reach their funding goal.</li>
                      <li>Users are responsible for securing their own crypto wallets and private keys.</li>
                      <li>CryptoCrowd is not responsible for any losses due to user error, blockchain network issues, or wallet security breaches.</li>
                      <li>The platform reserves the right to disable campaigns that violate our terms or are suspected of fraudulent activity.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="campaign-creators">
                  <AccordionTrigger>For Campaign Creators</AccordionTrigger>
                  <AccordionContent>
                    <h4 className="font-medium mb-2">Campaign Creation and Management</h4>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Creators must provide accurate and truthful information about their campaigns.</li>
                      <li>Campaign goals must be reasonable and achievable within the stated timeframe.</li>
                      <li>Creators can set a campaign duration between 1 day and 365 days.</li>
                      <li>The maximum fundraising goal is capped at 1000 Wei per campaign.</li>
                      <li>Creators can only withdraw funds after their campaign reaches its funding goal.</li>
                      <li>Each creator can have up to 100 active campaigns at any time.</li>
                    </ul>
                    
                    <h4 className="font-medium mb-2">Responsibilities</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Creators are solely responsible for fulfilling the promises made in their campaign.</li>
                      <li>Creators must provide regular updates to backers about campaign progress.</li>
                      <li>Misleading backers or failing to deliver on campaign promises may result in account restrictions and possible legal consequences.</li>
                      <li>Creators must comply with all applicable laws and regulations in their jurisdiction.</li>
                      <li>Prohibited campaigns include those promoting illegal activities, hate speech, violence, or fraudulent schemes.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="backers-donors">
                  <AccordionTrigger>For Backers/Donors</AccordionTrigger>
                  <AccordionContent>
                    <h4 className="font-medium mb-2">Backing Campaigns</h4>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>All donations are processed through blockchain transactions and are recorded on-chain.</li>
                      <li>Backers should conduct their own research before funding any campaign.</li>
                      <li>Backing a campaign is not a guarantee of the campaign&apos;s success or delivery.</li>
                      <li>The minimum donation amount is determined by blockchain transaction limitations.</li>
                      <li>Backers can track all their donations through their account dashboard.</li>
                    </ul>
                    
                    <h4 className="font-medium mb-2">Refunds</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>If a campaign fails to reach its funding goal by the deadline, backers can request refunds through the platform.</li>
                      <li>Refunds for failed campaigns are available for a limited period (7 days) after campaign end.</li>
                      <li>After the 7-day refund window closes, any unclaimed funds from failed campaigns will be automatically claimed by the platform owner.</li>
                      <li>For successful campaigns, refunds are at the discretion of the campaign creator.</li>
                      <li>Gas fees for transactions cannot be refunded.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="smart-contracts">
                  <AccordionTrigger>Smart Contract Terms</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>All platform operations are governed by smart contracts deployed on the blockchain.</li>
                      <li>Smart contracts control campaign creation, funding, withdrawals, and refunds.</li>
                      <li>The platform uses a factory contract to create individual campaign contracts for each fundraiser.</li>
                      <li>Campaign funds are held in escrow by the smart contract until conditions are met.</li>
                      <li>Smart contract code is open source and available for review.</li>
                      <li>The platform follows an &quot;all-or-nothing&quot; funding model - campaigns must reach their funding goal to receive any funds.</li>
                      <li>If a campaign fails to reach its goal, backers have a 7-day window to claim refunds.</li>
                      <li>After the refund window closes, any remaining funds from failed campaigns are claimed by the platform owner.</li>
                      <li>While we strive for perfect security, users acknowledge that smart contracts may contain vulnerabilities.</li>
                      <li>The platform owner has limited administrative capabilities to help protect users in emergency situations.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="privacy-security">
                  <AccordionTrigger>Privacy & Security</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>The platform collects minimal personal information necessary for operation.</li>
                      <li>Campaign details, donations, and wallet addresses are publicly visible on the blockchain.</li>
                      <li>We use IPFS for storing campaign images and other media in a decentralized manner.</li>
                      <li>Users are responsible for maintaining the security of their crypto wallets.</li>
                      <li>We never request private keys or seed phrases from users.</li>
                      <li>Communications between the platform and users are encrypted.</li>
                      <li>Third-party services may be used for certain platform functionalities.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="liability">
                  <AccordionTrigger>Limitation of Liability</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>CryptoCrowd is a technology platform that connects campaign creators with backers.</li>
                      <li>We do not endorse or guarantee any campaigns listed on our platform.</li>
                      <li>Users acknowledge that backing campaigns involves risk, and CryptoCrowd is not responsible for campaign outcomes.</li>
                      <li>Due to the decentralized nature of blockchain, there is no formal dispute resolution mechanism within the platform.</li>
                      <li>Users should resolve any disputes directly with the other parties involved.</li>
                      <li>CryptoCrowd cannot reverse completed blockchain transactions.</li>
                      <li>The platform is not responsible for the quality, safety, or legality of campaigns.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="modifications">
                  <AccordionTrigger>Modifications to Terms</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>These terms and conditions may be updated from time to time.</li>
                      <li>Users will be notified of significant changes to the terms.</li>
                      <li>Continued use of the platform after changes constitutes acceptance of the new terms.</li>
                      <li>The latest version of the terms will always be available on the platform.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        
        <section className="mb-12">
          <div className="flex items-start gap-4">
            <Users className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Community</h2>
              <p className="mb-4">
                CryptoCrowd brings together creators and backers from around the world, creating a 
                vibrant community of innovators, investors, and enthusiasts. Join us to be part of 
                a growing ecosystem that&apos;s transforming the way projects are funded and brought to life.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <Button asChild>
                  <Link href="/campaigns">Browse Campaigns</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/create">Start Your Project</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions or concerns about our platform or these terms and conditions, 
                please contact us at <span className="font-medium">support@cryptocrowd.com</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
} 